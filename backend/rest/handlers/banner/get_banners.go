package banner

import (
	"ecommerce/repo"
	"ecommerce/util"
	"net/http"
	"strconv"
)

// GetActiveBanners handles GET /banners (public) — only banners marked
// active and currently within their date window. This is what the
// storefront popup calls.
func (h *Handler) GetActiveBanners(w http.ResponseWriter, r *http.Request) {
	banners, err := h.bannerRepo.ListActive()
	if err != nil {
		util.SendError(w, http.StatusInternalServerError, "Error while getting banners")
		return
	}
	if banners == nil {
		banners = []*repo.Banner{}
	}
	util.SendData(w, http.StatusOK, banners)
}

// AdminListBanners handles GET /admin/banners (admin only) — every
// banner regardless of active status or date window, for the dashboard.
func (h *Handler) AdminListBanners(w http.ResponseWriter, r *http.Request) {
	banners, err := h.bannerRepo.ListAll()
	if err != nil {
		util.SendError(w, http.StatusInternalServerError, "Error while getting banners")
		return
	}
	if banners == nil {
		banners = []*repo.Banner{}
	}
	util.SendData(w, http.StatusOK, banners)
}

func (h *Handler) GetBanner(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		util.SendError(w, http.StatusBadRequest, "Invalid banner id")
		return
	}

	b, err := h.bannerRepo.Get(id)
	if err != nil {
		util.SendError(w, http.StatusInternalServerError, "Error while getting banner")
		return
	}
	if b == nil {
		util.SendError(w, http.StatusNotFound, "banner not found")
		return
	}
	util.SendData(w, http.StatusOK, b)
}
