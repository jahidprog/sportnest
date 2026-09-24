package category

import (
	"ecommerce/repo"
	"ecommerce/util"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"github.com/lib/pq"
)

func (h *Handler) GetCategories(w http.ResponseWriter, r *http.Request) {
	categories, err := h.categoryRepo.List()
	if err != nil {
		util.SendError(w, http.StatusInternalServerError, "Error while getting category list")
		return
	}
	if categories == nil {
		categories = []*repo.Category{}
	}
	util.SendData(w, http.StatusOK, categories)
}

func (h *Handler) UpdateCategory(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		util.SendError(w, http.StatusBadRequest, "invalid category id")
		return
	}
	var req CreateCategoryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || strings.TrimSpace(req.Name) == "" {
		util.SendError(w, http.StatusBadRequest, "name is required")
		return
	}
	category, err := h.categoryRepo.Update(repo.Category{ID: id, Name: strings.TrimSpace(req.Name), Slug: slugify(req.Name)})
	if err != nil {
		writeCategoryError(w, err)
		return
	}
	util.SendData(w, http.StatusOK, category)
}

type deleteCategoryRequest struct {
	ReplacementCategoryID *int `json:"replacement_category_id"`
}

func (h *Handler) DeleteCategory(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		util.SendError(w, http.StatusBadRequest, "invalid category id")
		return
	}
	var req deleteCategoryRequest
	if r.Body != nil {
		_ = json.NewDecoder(r.Body).Decode(&req)
	}
	if err := h.categoryRepo.DeleteAndReassign(id, req.ReplacementCategoryID); err != nil {
		writeCategoryError(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func writeCategoryError(w http.ResponseWriter, err error) {
	if err == repo.ErrCategoryNotFound {
		util.SendError(w, http.StatusNotFound, "category not found")
		return
	}
	if pqErr, ok := err.(*pq.Error); ok && pqErr.Code == "23505" {
		util.SendError(w, http.StatusConflict, "a category with this name already exists")
		return
	}
	util.SendError(w, http.StatusBadRequest, err.Error())
}

type CreateCategoryRequest struct {
	Name string `json:"name"`
}

func (h *Handler) CreateCategory(w http.ResponseWriter, r *http.Request) {
	var req CreateCategoryRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		util.SendError(w, http.StatusBadRequest, "Error decoding data")
		return
	}
	if strings.TrimSpace(req.Name) == "" {
		util.SendError(w, http.StatusBadRequest, "name is required")
		return
	}

	category, err := h.categoryRepo.Create(repo.Category{
		Name: req.Name,
		Slug: slugify(req.Name),
	})
	if err != nil {
		if pqErr, ok := err.(*pq.Error); ok && pqErr.Code == "23505" {
			util.SendError(w, http.StatusConflict, "a category with this name already exists")
			return
		}
		util.SendError(w, http.StatusInternalServerError, "Internal Server error")
		return
	}

	util.SendData(w, http.StatusCreated, category)
}

func slugify(name string) string {
	s := strings.ToLower(strings.TrimSpace(name))
	return strings.ReplaceAll(s, " ", "-")
}
