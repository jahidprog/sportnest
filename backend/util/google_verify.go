package util

import (
	"crypto"
	"crypto/rsa"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"math/big"
	"net/http"
	"strings"
	"sync"
	"time"
)

type GoogleClaims struct {
	Sub           string `json:"sub"`
	Email         string `json:"email"`
	EmailVerified bool   `json:"email_verified"`
	GivenName     string `json:"given_name"`
	FamilyName    string `json:"family_name"`
	Aud           string `json:"aud"`
	Iss           string `json:"iss"`
	Exp           int64  `json:"exp"`
}

const googleCertsURL = "https://www.googleapis.com/oauth2/v3/certs"

var (
	googleKeysMu   sync.RWMutex
	googleKeys     = map[string]*rsa.PublicKey{}
	googleKeysTime time.Time
)

type googleJWKSet struct {
	Keys []struct {
		Kid string `json:"kid"`
		N   string `json:"n"`
		E   string `json:"e"`
	} `json:"keys"`
}

func refreshGoogleKeys() error {
	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Get(googleCertsURL)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	var set googleJWKSet
	if err := json.NewDecoder(resp.Body).Decode(&set); err != nil {
		return fmt.Errorf("decode google jwks: %w", err)
	}

	keys := make(map[string]*rsa.PublicKey, len(set.Keys))
	for _, k := range set.Keys {
		nBytes, err := base64.RawURLEncoding.DecodeString(k.N)
		if err != nil {
			continue
		}
		eBytes, err := base64.RawURLEncoding.DecodeString(k.E)
		if err != nil {
			continue
		}
		keys[k.Kid] = &rsa.PublicKey{
			N: new(big.Int).SetBytes(nBytes),
			E: int(new(big.Int).SetBytes(eBytes).Int64()),
		}
	}

	googleKeysMu.Lock()
	googleKeys = keys
	googleKeysTime = time.Now()
	googleKeysMu.Unlock()
	return nil
}

func getGoogleKey(kid string) (*rsa.PublicKey, error) {
	googleKeysMu.RLock()
	stale := time.Since(googleKeysTime) > time.Hour
	key, ok := googleKeys[kid]
	googleKeysMu.RUnlock()

	if ok && !stale {
		return key, nil
	}
	if err := refreshGoogleKeys(); err != nil {
		return nil, err
	}
	googleKeysMu.RLock()
	key, ok = googleKeys[kid]
	googleKeysMu.RUnlock()
	if !ok {
		return nil, errors.New("no matching google signing key")
	}
	return key, nil
}

// VerifyGoogleIDToken checks the token's RS256 signature against Google's
// published public keys, and validates issuer/audience/expiry — the same
// checks Google's own client libraries perform, implemented directly
// with stdlib crypto instead of adding a JWT library dependency. This
// codebase already hand-rolls its own session JWTs in create_jwt.go, so
// this matches that existing approach rather than introducing a second,
// different way of doing JWTs.
func VerifyGoogleIDToken(clientID, idToken string) (*GoogleClaims, error) {
	parts := strings.Split(idToken, ".")
	if len(parts) != 3 {
		return nil, errors.New("malformed token")
	}
	headerB64, payloadB64, sigB64 := parts[0], parts[1], parts[2]

	var header struct {
		Kid string `json:"kid"`
		Alg string `json:"alg"`
	}
	headerBytes, err := base64.RawURLEncoding.DecodeString(headerB64)
	if err != nil {
		return nil, errors.New("malformed token header")
	}
	if err := json.Unmarshal(headerBytes, &header); err != nil {
		return nil, errors.New("malformed token header")
	}
	if header.Alg != "RS256" {
		return nil, fmt.Errorf("unexpected signing algorithm: %s", header.Alg)
	}

	key, err := getGoogleKey(header.Kid)
	if err != nil {
		return nil, fmt.Errorf("fetch google signing key: %w", err)
	}

	sig, err := base64.RawURLEncoding.DecodeString(sigB64)
	if err != nil {
		return nil, errors.New("malformed token signature")
	}

	signedData := headerB64 + "." + payloadB64
	hashed := sha256.Sum256([]byte(signedData))
	if err := rsa.VerifyPKCS1v15(key, crypto.SHA256, hashed[:], sig); err != nil {
		return nil, errors.New("signature verification failed")
	}

	payloadBytes, err := base64.RawURLEncoding.DecodeString(payloadB64)
	if err != nil {
		return nil, errors.New("malformed token payload")
	}
	var claims GoogleClaims
	if err := json.Unmarshal(payloadBytes, &claims); err != nil {
		return nil, errors.New("malformed token claims")
	}

	if claims.Aud != clientID {
		return nil, errors.New("token audience does not match this app's client id")
	}
	if claims.Iss != "https://accounts.google.com" && claims.Iss != "accounts.google.com" {
		return nil, fmt.Errorf("unexpected token issuer: %s", claims.Iss)
	}
	if time.Now().Unix() > claims.Exp {
		return nil, errors.New("token has expired")
	}
	if !claims.EmailVerified {
		return nil, errors.New("google account email is not verified")
	}

	return &claims, nil
}
