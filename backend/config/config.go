package config

import (
	"fmt"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

var configuration *Config

type DBConfig struct {
	Host          string
	Port          int
	Name          string
	User          string
	Password      string
	EnableSSLMODE bool
}

type Config struct {
	Version        string
	ServiceName    string
	HttpPort       int
	JWTSecretkey   string
	GoogleClientID string
	AllowedOrigin  string
	DB             *DBConfig
	WhatsApp       *WhatsAppConfig
	Upload         *UploadConfig
}

type WhatsAppConfig struct {
	Token      string
	PhoneID    string
	AdminPhone string // E.164 format, e.g. "8801XXXXXXXXX" — receives "new order" pings
}

type UploadConfig struct {
	Dir       string // local disk directory files are saved to and served from
	MaxSizeMB int64
}

func loadConfig() {
	godotenv.Load()

	version := os.Getenv("VERSION")
	if version == "" {
		fmt.Println("VERSION is not set")
		os.Exit(1)
	}

	serviceName := os.Getenv("SERVICE_NAME")
	if serviceName == "" {
		fmt.Println("SERVICE_NAME is not set")
		os.Exit(1)
	}

	httpPort := os.Getenv("HTTP_PORT")
	if httpPort == "" {
		fmt.Println("HTTP_PORT is not set")
		os.Exit(1)
	}

	httpPortInt, err := strconv.Atoi(httpPort)
	if err != nil {
		fmt.Println("HTTP_PORT is not a valid integer")
		os.Exit(1)
	}

	jwtSecretKey := os.Getenv("JWT_SECRET_KEY")
	if jwtSecretKey == "" {
		fmt.Println("No JWT secret key")
		os.Exit(1)
	}

	// Optional — Google Sign-In just won't work if unset, but the rest of
	// the app (email/password auth, everything else) boots and runs fine
	// without it.
	googleClientID := os.Getenv("GOOGLE_CLIENT_ID")
	if googleClientID == "" {
		fmt.Println("GOOGLE_CLIENT_ID not set — Google Sign-In will be unavailable")
	}

	dbHost := os.Getenv("DB_HOST")
	if dbHost == "" {
		fmt.Println("db HOST is Needed")
		os.Exit(1)
	}

	dbUser := os.Getenv("DB_USER")
	if dbUser == "" {
		fmt.Println("db User is Needed")
		os.Exit(1)
	}

	dbPassword := os.Getenv("DB_PASSWORD")
	if dbPassword == "" {
		fmt.Println("db Password is Needed")
		os.Exit(1)
	}

	dbPort := os.Getenv("DB_PORT")
	if dbPort == "" {
		fmt.Println("db Port is Needed")
		os.Exit(1)
	}

	dbPortInt, err := strconv.Atoi(dbPort)
	if err != nil {
		fmt.Println("db PORT is not a valid integer")
		os.Exit(1)
	}

	dbName := os.Getenv("DB_NAME")
	if dbName == "" {
		fmt.Println("db Name is Needed")
		os.Exit(1)
	}

	enableSSLMode := os.Getenv("DB_SSLMODE")
	enableSSLMode_boolean, err := strconv.ParseBool(enableSSLMode)
	if err != nil {
		fmt.Println("invalid ssl mode value", err)
		os.Exit(1)
	}

	dbConfig := &DBConfig{
		Host:          dbHost,
		Port:          dbPortInt,
		Name:          dbName,
		User:          dbUser,
		Password:      dbPassword,
		EnableSSLMODE: enableSSLMode_boolean,
	}

	// Not required — defaults to allowing any origin for local dev. Set
	// this to your real frontend/dashboard URL(s) before deploying.
	allowedOrigin := os.Getenv("ALLOWED_ORIGIN")
	if allowedOrigin == "" {
		allowedOrigin = "*"
	}

	// WhatsApp notifications are optional — if unset, the notification
	// service just silently no-ops instead of failing checkout/status
	// updates. Lets you run the server locally without a Meta Business
	// account set up yet.
	whatsAppConfig := &WhatsAppConfig{
		Token:      os.Getenv("WHATSAPP_TOKEN"),
		PhoneID:    os.Getenv("WHATSAPP_PHONE_ID"),
		AdminPhone: os.Getenv("WHATSAPP_ADMIN_PHONE"),
	}
	if whatsAppConfig.Token == "" || whatsAppConfig.PhoneID == "" {
		fmt.Println("WhatsApp not configured (WHATSAPP_TOKEN / WHATSAPP_PHONE_ID unset) — order notifications will be skipped")
	}

	// Optional — defaults to ./uploads and 5MB if unset. See the comment
	// on UploadImage in rest/handlers/upload for why this is local-disk
	// storage rather than S3/Cloudinary, and what that tradeoff means.
	uploadDir := os.Getenv("UPLOAD_DIR")
	if uploadDir == "" {
		uploadDir = "./uploads"
	}
	maxUploadMB := int64(5)
	if v := os.Getenv("MAX_UPLOAD_MB"); v != "" {
		if parsed, err := strconv.ParseInt(v, 10, 64); err == nil && parsed > 0 {
			maxUploadMB = parsed
		}
	}
	uploadConfig := &UploadConfig{Dir: uploadDir, MaxSizeMB: maxUploadMB}

	configuration = &Config{
		Version:        version,
		ServiceName:    serviceName,
		HttpPort:       httpPortInt,
		JWTSecretkey:   jwtSecretKey,
		GoogleClientID: googleClientID,
		AllowedOrigin:  allowedOrigin,
		DB:             dbConfig,
		WhatsApp:       whatsAppConfig,
		Upload:         uploadConfig,
	}
}

func GetConfig() *Config {
	if configuration == nil {
		loadConfig()
	}
	return configuration
}
