import * as adminRender from "../renders/admin.render.js";
import * as adminService from "../services/admin.service.js";
import * as carService from "../services/car.service.js";

class AdminController {
    constructor({ tbody, table, emptyState, formInputs, saveBtn }) {
        this.tbody = tbody;
        this.table = table;
        this.emptyState = emptyState;
        this.formInputs = formInputs;
        this.saveBtn = saveBtn;
        this.isLoading = false;
        this._listeners = [];
        this.items = [];
    }

    async mount() {
        await this._showAllCars();
        this._bindEvents();
    }

    destroy() {
        this._listeners.forEach(({ element, type, fn }) => {
            element.removeEventListener(type, fn);
        });
        this._listeners = [];
        this.items = [];
        this.tbody = null;
        this.table = null;
        this.emptyState = null;
        this.formInputs = null;
        this.saveBtn = null;
    }

    async _showAllCars() {
        try {
            this.isLoading = true;
            const result = await adminService.getAllCars();

            if (!result.success || !result.data || result.data.length === 0) {
                this.items = [];
                return adminRender.showEmptyState(this.tbody, this.table, this.emptyState);
            }

            this.items = result.data;
            adminRender.renderCars(this.items, this.tbody);
        } catch (err) {
            console.error("Failed to load cars:", err);
            adminRender.showEmptyState(this.tbody, this.table, this.emptyState);
        } finally {
            this.isLoading = false;
        }
    }

    async _handleDeleteCar(id) {
        if (!id) return;

        const confirmed = confirm("Are you sure you want to permanently delete this vehicle?");
        if (!confirmed) return;

        try {
            this.isLoading = true;
            const result = await adminService.deleteCarById(id);

            if (result.success) {
                // Keep local list in sync
                this.items = this.items.filter((item) => item.id !== id);
                alert("Car deleted successfully");
                await this._showAllCars();
            } else {
                alert("Failed to delete car: " + (result.error || "Unknown error"));
            }
        } catch (err) {
            console.error(err);
            alert("An error occurred while deleting the car.");
        } finally {
            this.isLoading = false;
        }
    }

    async _handleAddCar() {
        const { brand, model, year, price, color, description, image, category, available } =
            this.formInputs;

        const carData = {
            brand: brand?.value || "",
            model: model?.value || "",
            year: Number(year?.value) || new Date().getFullYear(),
            price: Number(price?.value) || 0,
            color: color?.value || "#C9A24B",
            description: description?.value?.trim() || "",
            category: category?.value || "",
            availability: available ? available.checked : true,
        };

        const imageData = image?.files?.[0] || null;
       
        // Basic validation matching the required fields in the HTML
        if (!carData.brand || !carData.model || !carData.price || !carData.category) {
            alert("Please fill in all required fields (Brand, Model, Price, Category).");
            return;
        }

        try {
            this.isLoading = true;
            this.saveBtn.textContent = "Saving…";
            this.saveBtn.disabled = true;

            const result = await carService.addCar(carData, imageData);
            console.log("Add car result:", result);

            if (!result.success) {
                console.log("Add car failed:", result.error);
                return;
            }

            alert("Car added successfully!");

            // Close the slide-over
            const addToggle = document.querySelector("#panel-add");
            if (addToggle) addToggle.checked = false;

            // Clear form
            Object.values(this.formInputs).forEach((input) => {
                if (!input) return;
                if (input.type === "file") {
                    input.value = "";
                } else if (input.type === "checkbox") {
                    input.checked = input.id === "avail-add"; // keep availability defaulted to true
                } else if (input.tagName === "SELECT") {
                    input.selectedIndex = 0;
                } else {
                    input.value = "";
                }
            });

            await this._showAllCars();
        } catch (err) {
            console.error(err);
            alert("An error occurred while saving.");
        } finally {
            this.isLoading = false;
            this.saveBtn.textContent = "Save Car";
            this.saveBtn.disabled = false;
        }
    }

    _bindEvents() {
        // Delete buttons (event delegation)
        this._on(this.tbody, "click", async (e) => {
            const deleteBtn = e.target.closest(".del");
            if (!deleteBtn || !deleteBtn.dataset.id) return;
            await this._handleDeleteCar(deleteBtn.dataset.id);
        });

        // Save / Add car
        if (this.saveBtn) {
            this._on(this.saveBtn, "click", async (e) => {
                e.preventDefault();
                if (this.isLoading) return;
                await this._handleAddCar();
            });
        }
    }

    _on(element, type, fn) {
        if (!element) return;
        element.addEventListener(type, fn);
        this._listeners.push({ element, type, fn });
    }
}

const adminCarsInit = () => {
    const tbody = document.querySelector("tbody");
    const table = document.querySelector("table");
    const emptyState = document.querySelector(".empty-state");

    // More complete form mapping (add the missing class / id on the category <select> in HTML)
    const addPanel = document.querySelector('aside.panel[aria-label="Add new car"]');

    const formInputs = {
        brand: addPanel.querySelector(".brand"),
        model: addPanel.querySelector(".model"),
        year: addPanel.querySelector(".year"),
        price: addPanel.querySelector(".price"),
        color: addPanel.querySelector(".color"),
        description: addPanel.querySelector(".description"),
        image: addPanel.querySelector(".image"),
        category: addPanel.querySelector(".category"),
        available: document.querySelector("#avail-add"),
    };

    const saveBtn = document.querySelector(".savebtn");

    const adminController = new AdminController({
        tbody,
        table,
        emptyState,
        formInputs,
        saveBtn,
    });

    adminController.mount();
};

adminCarsInit();