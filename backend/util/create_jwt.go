package util

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"strings"
	"time"
)

type Header struct {
	Alg string `json:"alg"`
	Typ string `json:"typ"`
}

// Payload is what we encode into every JWT. Exp is a Unix timestamp —
// without it, tokens are valid forever, which is what the old
// implementation did (that was bug #1 to fix here).
type Payload struct {
	Sub         int    `json:"sub"`
	FirstName   string `json:"first_name"`
	LastName    string `json:"last_name"`
	Email       string `json:"email"`
	IsShopOwner bool   `json:"is_shop_owner"`
	Exp         int64  `json:"exp"`
}

// tokenTTL is how long an access token stays valid. For v1 this is a
// single long-lived token; a refresh-token flow can replace this later
// without changing the Payload shape.
const tokenTTL = 7 * 24 * time.Hour

func CreateJWT(secret string, data Payload) (string, error) {
	data.Exp = time.Now().Add(tokenTTL).Unix()

	header := Header{
		Alg: "HS256",
		Typ: "JWT",
	}

	byteArrHeader, err := json.Marshal(header)
	if err != nil {
		return "", err
	}
	//header converted to base64 encoding
	headerB64 := base64UrlEncoding(byteArrHeader)

	byteArrPayload, err := json.Marshal(data)
	if err != nil {
		return "", err
	}
	//payload converted to base64 encoding
	payloadB64 := base64UrlEncoding(byteArrPayload)

	message := headerB64 + "." + payloadB64

	byteArrSecret := []byte(secret)
	byteArrMessage := []byte(message)

	h := hmac.New(sha256.New, byteArrSecret)
	h.Write(byteArrMessage)

	signature := h.Sum(nil)
	signatureB64 := base64UrlEncoding(signature)

	jwt := headerB64 + "." + payloadB64 + "." + signatureB64

	return jwt, nil

}

var (
	ErrMalformedToken = errors.New("malformed token")
	ErrBadSignature   = errors.New("signature does not match")
	ErrExpiredToken   = errors.New("token has expired")
)

// VerifyJWT checks the signature against secret, checks the token hasn't
// expired, and returns the decoded payload/claims. This is used by both
// the JWT middleware (to authenticate a request) and anything that needs
// to know who the request is from (e.g. an admin-only check).
func VerifyJWT(secret, token string) (*Payload, error) {
	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return nil, ErrMalformedToken
	}
	headerB64, payloadB64, signatureB64 := parts[0], parts[1], parts[2]

	message := headerB64 + "." + payloadB64
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(message))
	expectedSig := base64UrlEncoding(mac.Sum(nil))

	if !hmac.Equal([]byte(expectedSig), []byte(signatureB64)) {
		return nil, ErrBadSignature
	}

	payloadBytes, err := base64.URLEncoding.WithPadding(base64.NoPadding).DecodeString(payloadB64)
	if err != nil {
		return nil, ErrMalformedToken
	}

	var payload Payload
	if err := json.Unmarshal(payloadBytes, &payload); err != nil {
		return nil, ErrMalformedToken
	}

	if payload.Exp == 0 || time.Now().Unix() > payload.Exp {
		return nil, ErrExpiredToken
	}

	return &payload, nil
}

func base64UrlEncoding(data []byte) string {
	return base64.URLEncoding.WithPadding(base64.NoPadding).EncodeToString(data)
}
