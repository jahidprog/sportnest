package upload

import (
	"crypto/rand"
	"ecommerce/util"
	"encoding/hex"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"time"
)

var allowedImageTypes = map[string]string{
	"image/jpeg": ".jpg",
	"image/png":  ".png",
	"image/webp": ".webp",
	"image/gif":  ".gif",
}

// UploadImage handles POST /admin/upload (admin only — see routes.go).
// Accepts a single multipart field named "image", validates it's
// actually an image (by sniffing file bytes, never trusting the
// client-supplied Content-Type header, which is trivially spoofed),
// saves it to disk under a random filename, and returns the URL it's
// served at.
//
// This is LOCAL DISK storage, served by this same Go process (see the
// static file handler registered in server.go). That's the right choice
// for a single-server prototype — no cloud credentials needed — but it
// has two real limits worth knowing before relying on it:
//  1. Uploaded files do NOT survive a redeploy that wipes the filesystem
//     (true of most container hosting platforms).
//  2. It won't work correctly if you ever run more than one server
//     instance, since each instance only sees its own local disk.
//
// Swap this for S3/Cloudinary/similar before either of those becomes a
// real problem — the handler's return shape ({"url": "..."}) is the same
// either way, so nothing calling this needs to change, just this file.
func (h *Handler) UploadImage(w http.ResponseWriter, r *http.Request) {
	maxBytes := h.maxSizeMB*1024*1024 + 1024 // +1KB slack for multipart form overhead
	r.Body = http.MaxBytesReader(w, r.Body, maxBytes)

	if err := r.ParseMultipartForm(h.maxSizeMB * 1024 * 1024); err != nil {
		util.SendError(w, http.StatusBadRequest, fmt.Sprintf("file too large (max %dMB) or invalid form", h.maxSizeMB))
		return
	}

	file, _, err := r.FormFile("image")
	if err != nil {
		util.SendError(w, http.StatusBadRequest, "missing 'image' file field")
		return
	}
	defer file.Close()

	buf := make([]byte, 512)
	n, err := file.Read(buf)
	if err != nil && err != io.EOF {
		util.SendError(w, http.StatusBadRequest, "could not read uploaded file")
		return
	}
	contentType := http.DetectContentType(buf[:n])
	ext, ok := allowedImageTypes[contentType]
	if !ok {
		util.SendError(w, http.StatusBadRequest, "unsupported file type — only JPEG, PNG, WEBP, and GIF are allowed")
		return
	}
	if _, err := file.Seek(0, io.SeekStart); err != nil {
		util.SendError(w, http.StatusInternalServerError, "internal server error")
		return
	}

	if err := os.MkdirAll(h.uploadDir, 0755); err != nil {
		util.SendError(w, http.StatusInternalServerError, "internal server error")
		return
	}

	// Never use the client-supplied filename — avoids path traversal
	// (e.g. "../../etc/passwd") and filename collisions entirely.
	filename := fmt.Sprintf("%d-%s%s", time.Now().UnixNano(), randomSuffix(), ext)
	destPath := filepath.Join(h.uploadDir, filename)

	dest, err := os.Create(destPath)
	if err != nil {
		util.SendError(w, http.StatusInternalServerError, "internal server error")
		return
	}
	defer dest.Close()

	if _, err := io.Copy(dest, file); err != nil {
		util.SendError(w, http.StatusInternalServerError, "internal server error")
		return
	}

	util.SendData(w, http.StatusCreated, map[string]string{
		"url": "/uploads/" + filename,
	})
}

func randomSuffix() string {
	b := make([]byte, 4)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}
