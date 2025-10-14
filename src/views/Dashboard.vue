<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { Html5Qrcode } from 'html5-qrcode';
import { useLayout } from '@/layout/composables/layout';
const { isDarkTheme } = useLayout();
const lineOptions = ref(null);
import { subscribeEstudents } from '@/service/Estudents.js';
import { markScan, subscribeScans, deleteAllScans } from '@/firebase';
// reactive list populated from Firestore via the service
const estudiantesData = ref([]);
let unsubEstudiantes = null;
let unsubScans = null;

const applyLightTheme = () => {
    lineOptions.value = {
        plugins: {
            legend: {
                labels: {
                    color: '#495057'
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: '#495057'
                },
                grid: {
                    color: '#ebedef'
                }
            },
            y: {
                ticks: {
                    color: '#495057'
                },
                grid: {
                    color: '#ebedef'
                }
            }
        }
    };
};

const applyDarkTheme = () => {
    lineOptions.value = {
        plugins: {
            legend: {
                labels: {
                    color: '#ebedef'
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: '#ebedef'
                },
                grid: {
                    color: 'rgba(160, 167, 181, .3)'
                }
            },
            y: {
                ticks: {
                    color: '#ebedef'
                },
                grid: {
                    color: 'rgba(160, 167, 181, .3)'
                }
            }
        }
    };
};

watch(
    isDarkTheme,
    (val) => {
        if (val) {
            applyDarkTheme();
        } else {
            applyLightTheme();
        }
    },
    { immediate: true }
);

// ------- Datos de ejemplo -------
/*const getEstudentsData = async () => { 
try {
const response = await fetch('../src/service/Estudents.json');
if (!response.ok) {
throw new Error('Error al cargar los datos de los estudiantes');
}
return await response.json();
} catch (error) {
console.error('Error al cargar los datos de los estudiantes:', error);
return [];
}
}*/

// ------- states -------
const cameras = ref([]);
const selectedCameraId = ref(0);
const isScanning = ref(false);
let html5QrcodeScanner = null;

const scanned = ref([]); // desde localStorage
const scanCounts = ref({});
// max invitations per CI
const MAX_INVITATIONS = 2;
// prevent duplicate rapid scans
const scanLocked = ref(false);
const clearingInProgress = ref(false);

const showModal = ref(false);
const modalData = ref(null);
const modalMessage = ref('');
const modalTitle = ref('');
const modalIcon = ref('pi pi-check'); // icono por defecto
const modalIconColor = ref('text-green-500'); // color por defecto

// Key localStorage
const LS_KEY = 'scannedStudents';

// ------- util: cargar/alamacenar LS -------
function loadScannedFromLS() {
    try {
        const raw = localStorage.getItem(LS_KEY);
        scanned.value = raw ? JSON.parse(raw) : [];
        // Nuevo: cargar conteo de escaneos
        const rawCounts = localStorage.getItem(LS_KEY + '_counts');
        scanCounts.value = rawCounts ? JSON.parse(rawCounts) : {};
    } catch (e) {
        console.error('Error parseando localStorage', e);
        scanned.value = [];
        scanCounts.value = {};
    }
}
function saveScannedToLS() {
    localStorage.setItem(LS_KEY, JSON.stringify(scanned.value));
    // Nuevo: guardar conteo de escaneos
    localStorage.setItem(LS_KEY + '_counts', JSON.stringify(scanCounts.value));
}

// ------- función para parsear texto QR y extraer CI -------

function normalizeCI(ci) {
    // limpiar espacios y comas, convertir letras a mayúscula, mantener puntos y guiones
    return ci.trim();
}

// ------- manejador onScan -------

async function onScanSuccess(decodedText, decodedResult) {
    // ignore scans while a clear operation is in progress
    if (clearingInProgress.value) return;
    // prevent handling multiple rapid detections
    if (scanLocked.value) return;
    scanLocked.value = true;
    // release lock shortly after to allow new scans
    setTimeout(() => (scanLocked.value = false), 1500);

    stopScanner();
    isScanning.value = false;
    //console.log('QR detectado:', decodedText)

    const cedula = normalizeCI(decodedText);
    if (!cedula) {
        modalTitle.value = 'QR leído — Formato desconocido';
        modalData.value = null;
        modalMessage.value = 'No se pudo extraer la CI del código QR.';
        showModal.value = true;
        return;
    }

    // Buscar en estudiantesData (proviene de Firestore; es un ref)
    const found = estudiantesData.value.find((s) => normalizeCI(s.ci) == cedula);
    console.log('FOUND', found);

    if (found) {
        // Nuevo: contar escaneos por CI
        if (!scanCounts.value[cedula]) {
            scanCounts.value[cedula] = 0;
        }
        // coerce to number and increment
        scanCounts.value[cedula] = Number(scanCounts.value[cedula]) + 1;
        saveScannedToLS();

        let count = Number(scanCounts.value[cedula]);
        let mensaje = '';
        if (count === 1) {
            mensaje = `invitacion 1/${MAX_INVITATIONS}`;
            modalTitle.value = 'GRADUANDO VERIFICADO';
            modalIcon.value = 'pi pi-check';
            modalIconColor.value = 'text-green-500';
        } else if (count === MAX_INVITATIONS) {
            mensaje = `invitacion ${MAX_INVITATIONS}/${MAX_INVITATIONS}`;
            modalTitle.value = 'GRADUANDO VERIFICADO';
            modalIcon.value = 'pi pi-check';
            modalIconColor.value = 'text-green-500';
        } else {
            mensaje = 'TODAS LAS INVITACIONES FUERON ESCANEADAS';
            modalTitle.value = 'GRADUANDO VERIFICADO';
            modalIcon.value = 'pi pi-times';
            modalIconColor.value = 'text-red-500';
        }
        modalMessage.value = mensaje;
        modalData.value = found;
        showModal.value = true;

        // Store scan in Firestore so other clients see it too (offline-enabled)
        try {
            await markScan(cedula, found || {});
        } catch (e) {
            console.warn('No se pudo marcar scan en Firestore:', e);
        }

        // Solo agregar a scanned la primera vez (UX local)
        const already = scanned.value.find((s) => normalizeCI(s.ci) == cedula);
        if (!already) {
            scanned.value.push(found);
            saveScannedToLS();
        }
    } else {
        isScanning.value = false; // opcional: detener tras cada lectura
        showModal.value = true;
        modalData.value = { nombres: '', ci: '', titulo: '' };
        modalTitle.value = 'NO ESTA EN LA LISTA DE INVITADOS';
        modalIcon.value = 'pi pi-times'; // icono de error
        modalMessage.value = 'SIN INVITACION';
        modalIconColor.value = 'text-red-500';
    }
}

// ------- iniciar/ detener scanner -------
async function startScanner() {
    if (isScanning.value) return;
    const qrRegionId = 'reader';
    // instancia Html5Qrcode con id del contenedor
    html5QrcodeScanner = new Html5Qrcode(qrRegionId, /* verbose= */ false);
    const config = { fps: 10, qrbox: 250 };
    try {
        const cameraId = selectedCameraId.value || (cameras.value[0] && cameras.value[0].id);
        if (!cameraId) {
            alert('No se detectó cámara disponible.');
            return;
        }
        await html5QrcodeScanner.start(
            cameraId,
            config,
            (decodedText, decodedResult) => {
                // Al detectar: ejecutar handler y opcionalmente parar por un momento para evitar lecturas repetidas
                onScanSuccess(decodedText, decodedResult);
                isScanning.value = false;
                // No detenemos para permitir múltiples lecturas, pero podrías pausar si lo deseas
            },
            (errorMessage) => {
                //fallos de lectura (opcional)
                //console.log('parse error', errorMessage)
            }
        );
        isScanning.value = true;
    } catch (err) {
        console.error('Error iniciando scanner', err);
        alert('Error iniciando la cámara: ' + err);
    }
}

async function stopScanner() {
    if (!isScanning.value || !html5QrcodeScanner) return;
    try {
        await html5QrcodeScanner.stop();
        await html5QrcodeScanner.clear();
    } catch (e) {
        console.warn('Error deteniendo scanner', e);
    } finally {
        isScanning.value = false;
        html5QrcodeScanner = null;
    }
}

// borrar almacenados
async function clearScanned() {
    if (!confirm('¿Borrar todos los escaneados guardados en localStorage y en Firebase?')) return;
    // mark clearing in progress to avoid re-adding via scanner
    const wasScanning = !!isScanning.value;
    clearingInProgress.value = true;
    try {
        // stop scanner temporarily
        if (wasScanning) await stopScanner();
    } catch (e) {
        console.warn('Error deteniendo scanner durante clear:', e);
    }

    scanned.value = [];
    scanCounts.value = {};
    saveScannedToLS();
    // try to delete remote scans as well
    try {
        await deleteAllScans();
    } catch (e) {
        console.warn('No se pudieron borrar los scans en Firestore:', e);
        // Consider retrying or marking a flag for later sync
    } finally {
        clearingInProgress.value = false;
        // restart scanner if it was running before
        if (wasScanning) {
            try {
                await startScanner();
            } catch (e) {
                console.warn('No se pudo reiniciar scanner tras clear:', e);
            }
        }
    }
    // As a safety, after a short delay re-check and clear scanned/localStorage
    setTimeout(() => {
        scanned.value = [];
        scanCounts.value = {};
        saveScannedToLS();
    }, 800);
}

// Modal handlers
async function handleCloseModal() {
    showModal.value = false;
    modalData.value = null;
    modalMessage.value = '';
    // Si el escáner estaba detenido, lo reanudamos
    if (!isScanning.value) {
        await startScanner();
    }
}

// obtener cámaras disponibles
async function listCameras() {
    try {
        const devices = await Html5Qrcode.getCameras();
        cameras.value = devices.map((d) => ({ id: d.id, label: d.label || d.id }));
        console.log('Cámaras detectadas:', cameras.value);
        if (cameras.value.length) selectedCameraId.value = cameras.value[0].id;
    } catch (e) {
        console.warn('No se pudieron listar cámaras', e);
        cameras.value = [];
    }
}

// ciclo de vida
onMounted(async () => {
    loadScannedFromLS();
    await listCameras();

    if (cameras.value.length) {
        var cantCameras = cameras.value.length - 1;
        selectedCameraId.value = cameras.value[cantCameras].id;
    }
    // Subscribe to graduandos collection (Firestore). This keeps the
    // component in sync with remote/offline data via the service.
    unsubEstudiantes = subscribeEstudents((items) => {
        estudiantesData.value = items;
    });
    // Subscribe to remote scans so the scanned list is synchronized across clients
    unsubScans = subscribeScans((items) => {
        // items: { id, ci, nombres, titulo, count, lastScanned }
        // If remote returns empty (e.g. offline or no remote scans) don't erase local list
        if (!items || items.length === 0) {
            if (scanned.value && scanned.value.length) {
                // keep local list as-is
                return;
            }
        }

        scanned.value = items.map((i) => ({ nombres: i.nombres || '', ci: i.ci || i.id, titulo: i.titulo || '', count: i.count || 1 }));
        // sync remote counts into local scanCounts map
        items.forEach((i) => {
            const key = normalizeCI(i.ci || i.id);
            scanCounts.value[key] = Number(i.count || 0);
        });
        saveScannedToLS();
    });
});

onBeforeUnmount(() => {
    // cleanup Firestore listener and scanner
    if (unsubEstudiantes) unsubEstudiantes();
    if (unsubScans) unsubScans();
    stopScanner();
});
</script>

<template>
    <div class="container">
        <h1>Escaner de invitaciones</h1>

        <div class="controls flex justify-center">
            <Button @click="startScanner" severity="success" :disabled="isScanning" class="mx-1">
                <!-- play icon -->
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true"><path d="M10.804 8 5 11.618V4.382L10.804 8z"/></svg>
            </Button>
            <Button @click="stopScanner" severity="secondary" :disabled="!isScanning" class="mx-1">
                <!-- pause icon -->
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true"><path d="M5.5 3.5A1.5 1.5 0 004 5v6a1.5 1.5 0 001.5 1.5h.5A.5.5 0 007.5 12V4a.5.5 0 00-.5-.5h-1zM10.5 3.5A1.5 1.5 0 009 5v6a1.5 1.5 0 001.5 1.5h.5A.5.5 0 0012.5 12V4a.5.5 0 00-.5-.5h-1z"/></svg>
            </Button>
            <Button @click="clearScanned" severity="danger" class="mx-1 mr-4">
                <!-- trash icon -->
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true"><path d="M5.5 5.5A.5.5 0 016 6v6a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zm5 0A.5.5 0 0111 6v6a.5.5 0 01-1 0V6a.5.5 0 011-0z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 01-1 1H13v9.5A1.5 1.5 0 0111.5 15h-7A1.5 1.5 0 013 13.5V4H2.5a1 1 0 010-2h3.09a1 1 0 00.9-.55L7.1.44A1 1 0 017.9 0h0a1 1 0 01.9.44l.61.99c.23.38.65.62 1.09.62H13.5a1 1 0 011 1zM6.118 1l-.39.63A1 1 0 015.5 2h5a1 1 0 01-.228-.37L10.882 1H6.118z" clip-rule="evenodd"/></svg>
            </Button>
        </div>

        <div id="reader" style="width: 500px; max-width: 100%; margin-top: 1rem; margin-bottom: 1rem"></div>

        <div class="card flex justify-center">
            <span class="text-surface-500 dark:text-surface-400 block mb-2"></span>
            <div v-if="scanned.length">
                <div v-for="s in scanned" :key="s.ci">
                    
                    <Button class="mb-1" outlined severity="secondary"><Badge class="mr-1" size="large" :value="s.count > 2 ? 2 : s.count" severity="success"></Badge> {{ s.nombres.toUpperCase() }} — {{ s.titulo.toUpperCase() }} </Button>
                </div>
            </div>
            <p v-else>No hay escaneados aún.</p>
        </div>

        <!-- Modal -->
        <Dialog v-model:visible="showModal" modal :style="{ width: '25rem' }">
            <!-- Header -->
            <template #header>
                <div class="flex items-center justify-center gap-2">
                    <svg v-if="modalTitle === 'GRADUANDO VERIFICADO'" xmlns="http://www.w3.org/2000/svg" class="text-green-500" width="28" height="28" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-7.364 7.364a1 1 0 01-1.414 0L3.293 9.364a1 1 0 011.414-1.414L8 11.243l6.293-6.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                    <svg v-else-if="modalTitle === 'NO ESTA EN LA LISTA DE INVITADOS'" xmlns="http://www.w3.org/2000/svg" class="text-red-500" width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M6.225 4.811a1 1 0 011.414 0L12 9.172l4.361-4.361a1 1 0 111.414 1.414L13.414 10.586l4.361 4.361a1 1 0 01-1.414 1.414L12 12l-4.361 4.361a1 1 0 01-1.414-1.414L10.586 10.586 6.225 6.225a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
                    <span class="font-bold text-lg text-center">{{ modalTitle }}</span>
                </div>
            </template>

            <!-- contenido -->
            <div class="items-center text-center px-4 py-2">
                <div class="text-5xl mb-2">
                    <svg v-if="modalIcon && modalIcon.includes('check')" xmlns="http://www.w3.org/2000/svg" :class="modalIconColor" width="48" height="48" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-7.364 7.364a1 1 0 01-1.414 0L3.293 9.364a1 1 0 011.414-1.414L8 11.243l6.293-6.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                    <svg v-else-if="modalIcon && modalIcon.includes('times')" xmlns="http://www.w3.org/2000/svg" :class="modalIconColor" width="48" height="48" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M6.225 4.811a1 1 0 011.414 0L12 9.172l4.361-4.361a1 1 0 111.414 1.414L13.414 10.586l4.361 4.361a1 1 0 01-1.414 1.414L12 12l-4.361 4.361a1 1 0 01-1.414-1.414L10.586 10.586 6.225 6.225a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
                </div>

                <!-- mensaje principal -->
                <div class="text-lg font-semibold mb-4">{{ modalMessage.toUpperCase() }}</div>

                <!-- Informacion del estudiante -->
                <div class="text-surface-500 dark:text-surface-400 text-sm space-y-1">
                    <p class="">NOMBRE: {{ modalData.nombres.toUpperCase() }}</p>
                    <p>C.I: {{ modalData.ci.toUpperCase() }}</p>
                    <p>CARRERA: {{ modalData.titulo.toUpperCase() }}</p>
                </div>
            </div>

            <!-- Footer -->
            <div class="flex justify-end px-4 py-2">
                <Button type="button" label="Cerrar" severity="secondary" @click="handleCloseModal" />
            </div>
        </Dialog>
    </div>
</template>
