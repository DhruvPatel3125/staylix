import Swal from 'sweetalert2';

const toast = Swal.mixin({
    toast: true,
    position: 'top-right',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
});

export const showToast = {
    success: (message) => {
        toast.fire({
            icon: 'success',
            title: message
        });
    },
    error: (message) => {
        toast.fire({
            icon: 'error',
            title: message
        });
    },
    info: (message) => {
        toast.fire({
            icon: 'info',
            title: message
        });
    },
    warning: (message) => {
        toast.fire({
            icon: 'warning',
            title: message
        });
    }
};

export const showAlert = {
    success: (title, text) => {
        Swal.fire({
            icon: 'success',
            title,
            text,
            confirmButtonColor: '#667eea'
        });
    },
    error: (title, text) => {
        Swal.fire({
            icon: 'error',
            title,
            text,
            confirmButtonColor: '#f56565'
        });
    },
    confirm: async (title, text) => {
        const result = await Swal.fire({
            title,
            text,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#667eea',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, proceed!',
            cancelButtonText: 'Cancel'
        });
        return result.isConfirmed;
    }
};

export default { showToast, showAlert };
