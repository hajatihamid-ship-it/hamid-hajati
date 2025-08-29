// This file contains helper functions for DOM manipulation and UI interactions.

export const sanitizeHTML = (str: string): string => {
    if (typeof str !== 'string') return '';
    const temp = document.createElement("div");
    temp.textContent = str;
    return temp.innerHTML;
};

export const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    const icon = type === "success" ? "check-circle" : "alert-triangle";
    const colors = type === "success" ? "bg-green-500 border-green-600" : "bg-red-500 border-red-600";
    
    toast.className = `flex items-center gap-3 ${colors} text-white py-3 px-5 rounded-lg shadow-xl border-b-4 transform opacity-0 translate-x-full`;
    toast.style.transition = "transform 0.5s ease, opacity 0.5s ease";
    toast.innerHTML = `
        <i data-lucide="${icon}" class="w-6 h-6"></i>
        <span>${sanitizeHTML(message)}</span>
    `;

    container.appendChild(toast);
    window.lucide?.createIcons();

    requestAnimationFrame(() => {
        toast.classList.remove("opacity-0", "translate-x-full");
    });

    setTimeout(() => {
        toast.classList.add("opacity-0");
        toast.style.transform = "translateX(120%)";
        toast.addEventListener("transitionend", () => toast.remove(), { once: true });
    }, 2000);
};

export const updateSliderTrack = (slider: HTMLInputElement) => {
    if (!slider) return;
    const min = +slider.min || 0;
    const max = +slider.max || 100;
    const val = (+slider.value || 0);
    const percentage = (val - min) / (max - min) * 100;
    
    // Check for custom color from parent
    const parentContainer = slider.closest('[class*="slider-container-"]');
    let accentColor = 'var(--accent)';
    if (parentContainer) {
        if (parentContainer.classList.contains('slider-container-blue')) accentColor = 'var(--admin-accent-blue)';
        else if (parentContainer.classList.contains('slider-container-green')) accentColor = 'var(--admin-accent-green)';
        else if (parentContainer.classList.contains('slider-container-orange')) accentColor = 'var(--admin-accent-orange)';
    }

    const trackColor = getComputedStyle(document.documentElement).getPropertyValue("--range-track-bg").trim();
    slider.style.background = `linear-gradient(to left, ${accentColor} ${percentage}%, ${trackColor} ${percentage}%)`;
};

export const openModal = (modalElement: HTMLElement | null) => {
    if (!modalElement) return;
    modalElement.classList.remove("hidden");
    setTimeout(() => {
        modalElement.classList.add("active", "opacity-100", "pointer-events-auto");
        modalElement.querySelector('.card, form, .modal-content')?.classList.remove('scale-95');
    }, 10);
};

export const closeModal = (modalElement: HTMLElement | null) => {
    if (!modalElement) return;
    modalElement.classList.remove("active", "opacity-100", "pointer-events-auto");
    modalElement.querySelector('.card, form, .modal-content')?.classList.add('scale-95');
    setTimeout(() => {
        modalElement.classList.add("hidden");
    }, 300);
};

export const exportElement = async (elementToExportSelector: string, format: 'pdf' | 'png', filename: string, button: HTMLButtonElement) => {
    const { jsPDF } = window.jspdf;
    const html2canvas = window.html2canvas;

    const elementToExport = document.querySelector(elementToExportSelector) as HTMLElement;
    if (!elementToExport || !jsPDF || !html2canvas) {
        showToast('خطا در آماده‌سازی برای ذخیره.', 'error');
        return;
    }

    button.classList.add('is-loading');
    button.disabled = true;

    try {
        const exportContainer = document.createElement('div');
        exportContainer.className = 'program-page';
        exportContainer.innerHTML = elementToExport.innerHTML;
        document.body.appendChild(exportContainer);

        const canvas = await html2canvas(exportContainer, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff'
        });

        document.body.removeChild(exportContainer);

        if (format === 'png') {
            const imgData = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = imgData;
            link.download = filename;
            link.click();
        } else if (format === 'pdf') {
            const imgData = canvas.toDataURL('image/png');
            const { width, height } = canvas;
            const pdf = new jsPDF({
                orientation: width > height ? 'landscape' : 'portrait',
                unit: 'px',
                format: [width, height]
            });
            pdf.addImage(imgData, 'PNG', 0, 0, width, height);
            pdf.save(filename);
        }

        showToast(`فایل با موفقیت ذخیره شد.`, 'success');
    } catch (error) {
        console.error('Export Error:', error);
        showToast('خطا در ذخیره فایل.', 'error');
    } finally {
        button.classList.remove('is-loading');
        button.disabled = false;
    }
};