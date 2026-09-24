package banner

import (
	"ecommerce/repo"
	"ecommerce/util"
	"encoding/json"
	"net/http"
	"strconv"
	"time"
)

type bannerRequest struct {
	Title        string     `json:"title"`
	Subtitle     string     `json:"subtitle"`
	DiscountText string     `json:"discount_text"`
	ImageURL     string     `json:"image_url"`
	LinkURL      string     `json:"link_url"`
	CategoryID   *int       `json:"category_id,omitempty"`
	IsActive     bool       `json:"is_active"`
	StartsAt     *time.Time `json:"starts_at,omitempty"`
	EndsAt       *time.Time `json:"ends_at,omitempty"`
}

func (h *Handler) CreateBanner(w http.ResponseWriter, r *http.Request) {
	var req bannerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		util.SendError(w, http.StatusBadRequest, "Error decoding data")
		return
	}
	if req.Title == "" {
		util.SendError(w, http.StatusBadRequest, "title is required")
		return
	}
	if req.EndsAt != nil && req.StartsAt != nil && req.EndsAt.Before(*req.StartsAt) {
		util.SendError(w, http.StatusBadRequest, "ends_at must be after starts_at")
		return
	}

	created, err := h.bannerRepo.Create(repo.Banner{
		Title:        req.Title,
		Subtitle:     req.Subtitle,
		DiscountText: req.DiscountText,
		ImageURL:     req.ImageURL,
		LinkURL:      req.LinkURL,
		CategoryID:   req.CategoryID,
		IsActive:     req.IsActive,
		StartsAt:     req.StartsAt,
		EndsAt:       req.EndsAt,
	})
	if err != nil {
		util.SendError(w, http.StatusInternalServerError, "Internal Server error")
		return
	}
	util.SendData(w, http.StatusCreated, created)
}

func (h *Handler) UpdateBanner(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		util.SendError(w, http.StatusBadRequest, "Invalid banner id")
		return
	}

	var req bannerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		util.SendError(w, http.StatusBadRequest, "Error decoding data")
		return
	}
	if req.EndsAt != nil && req.StartsAt != nil && req.EndsAt.Before(*req.StartsAt) {
		util.SendError(w, http.StatusBadRequest, "ends_at must be after starts_at")
		return
	}

	updated, err := h.bannerRepo.Update(repo.Banner{
		ID:           id,
		Title:        req.Title,
		Subtitle:     req.Subtitle,
		DiscountText: req.DiscountText,
		ImageURL:     req.ImageURL,
		LinkURL:      req.LinkURL,
		CategoryID:   req.CategoryID,
		IsActive:     req.IsActive,
		StartsAt:     req.StartsAt,
		EndsAt:       req.EndsAt,
	})
	if err != nil {
		util.SendError(w, http.StatusInternalServerError, "Internal Server error")
		return
	}
	util.SendData(w, http.StatusOK, updated)
}

func (h *Handler) DeleteBanner(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		util.SendError(w, http.StatusBadRequest, "Invalid banner id")
		return
	}
	if err := h.bannerRepo.Delete(id); err != nil {
		util.SendError(w, http.StatusInternalServerError, "Error while deleting banner")
		return
	}
	util.SendData(w, http.StatusOK, map[string]string{"status": "deleted"})
}
