<template>
  <div class="container">
    <h1>Escaner de invitaciones</h1>
    
    <div class="controls flex justify-center">
      <Button @click="startScanner" severity="success" :disabled="isScanning" class="mx-1"><i class="pi pi-play"></i></Button>
      <Button @click="stopScanner" severity="secondary" :disabled="!isScanning" class="mx-1"><i class="pi pi-pause"></i></Button>
      <Button @click="clearScanned" severity="danger" class="mx-1 mr-4"><i class="pi pi-trash"></i></Button>
    </div>
    
    <div id="reader" style="width: 500px; max-width: 100%; margin-top: 1rem; margin-bottom: 1rem;"></div>
    
    <div class="card flex justify-center">
      <span class="text-surface-500 dark:text-surface-400 block mb-2"></span>
      <div v-if="scanned.length">
        <div v-for="s in scanned" :key="s.ci">
          <Button  class="mb-1 " severity="secondary">{{ s.nombres }} — {{ s.ci }} — {{ s.titulo }}</Button>
        </div>
      </div>
      <p v-else>No hay escaneados aún.</p>
    </div>
    
    <!-- Modal -->
    <Dialog v-model:visible="showModal" modal :style="{ width: '25rem' }">
      <!-- Header -->
      <template #header>
        <div class="flex items-center justify-center gap-2">
          <i
          v-if="modalTitle === 'GRADUANDO VERIFICADO'" class=" text-green-500 text-3xl"></i> 
          <i v-else-if="modalTitle === 'NO ESTA EN LA LISTA DE INVITADOS'" class="pi pi-times text-red-500 text-3xl"></i>
          <span class="font-bold text-lg text-center">{{ modalTitle }}</span>
        </div>
      </template>
      
      <!-- contenido -->
      <div class=" items-center text-center px-4 py-2">
        <i :class="modalIcon, modalIconColor"  class="text-5xl mb-2"></i>
        
        <!-- mensaje principal -->
        <div class="text-lg font-semibold mb-4">{{ modalMessage.toUpperCase() }}</div>
        
        <!-- Informacion del estudiante -->
        <div class="text-surface-500 dark:text-surface-400 text-sm space-y-1">
          <p class="">NOMBRE: {{modalData.nombres.toUpperCase() }}</p>
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

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { Html5Qrcode } from 'html5-qrcode'
import { useLayout } from '@/layout/composables/layout';
const { isDarkTheme } = useLayout();
const lineOptions = ref(null);
import estudiantesData from '@/service/Estudents.js'

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
const cameras = ref([])
const selectedCameraId = ref(0)
const isScanning = ref(false)
let html5QrcodeScanner = null

const scanned = ref([]) // desde localStorage
const scanCounts = ref({})


const showModal = ref(false)
const modalData = ref(null)
const modalMessage = ref('')
const modalTitle = ref('')
const modalIcon = ref('pi pi-check'); // icono por defecto
const modalIconColor = ref('text-green-500'); // color por defecto  

// Key localStorage
const LS_KEY = 'scannedStudents'

// ------- util: cargar/alamacenar LS -------
function loadScannedFromLS() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    scanned.value = raw ? JSON.parse(raw) : []
    // Nuevo: cargar conteo de escaneos
    const rawCounts = localStorage.getItem(LS_KEY + '_counts')
    scanCounts.value = rawCounts ? JSON.parse(rawCounts) : {}
  } catch (e) {
    console.error('Error parseando localStorage', e)
    scanned.value = []
    scanCounts.value = {}
  }
}
function saveScannedToLS() {
  localStorage.setItem(LS_KEY, JSON.stringify(scanned.value))
  // Nuevo: guardar conteo de escaneos
  localStorage.setItem(LS_KEY + '_counts', JSON.stringify(scanCounts.value))
}

// ------- función para parsear texto QR y extraer CI -------

function normalizeCI(ci) {
  // limpiar espacios y comas, convertir letras a mayúscula, mantener puntos y guiones
  return ci.trim()
}

// ------- manejador onScan -------

async function onScanSuccess(decodedText, decodedResult) {
  stopScanner()
  isScanning.value = false
  //console.log('QR detectado:', decodedText)
  
  const extracted = normalizeCI(decodedText)
  if (!extracted) {
    modalTitle.value = 'QR leído — Formato desconocido'
    modalData.value = null
    modalMessage.value = 'No se pudo extraer la CI del código QR.'
    showModal.value = true
    return
  }
  
  // Buscar en estudiantesData
  const found = estudiantesData.find(s => normalizeCI(s.ci) == extracted)
  console.log("FOUND", found)
  
  if (found) {
    // Nuevo: contar escaneos por CI
    if (!scanCounts.value[extracted]) {
      scanCounts.value[extracted] = 0
    }
    scanCounts.value[extracted]++
    saveScannedToLS()
    
    let count = scanCounts.value[extracted]
    let mensaje = ''
    if (count === 1) {
      mensaje = 'invitacion 1/2'
      modalTitle.value = 'GRADUANDO VERIFICADO'
      modalIcon.value = 'pi pi-check'
      modalIconColor.value = 'text-green-500' 
      
    } else if (count === 2) {
      mensaje = 'invitacion 2/2'
      modalTitle.value = 'GRADUANDO VERIFICADO'
      modalIcon.value = 'pi pi-check'
      modalIconColor.value = 'text-green-500' 
      
    } else {
      mensaje = 'TODAS LAS INVITACIONES FUERON ESCANEADAS'
      modalTitle.value = 'GRADUANDO VERIFICADO'
      modalIcon.value = 'pi pi-times'
      modalIconColor.value = 'text-red-500'  
    }
    modalMessage.value = mensaje
    modalData.value = found
    showModal.value = true
    
    // Solo agregar a scanned la primera vez
    const already = scanned.value.find(s => normalizeCI(s.ci) == extracted)
    if (!already) {
      scanned.value.push(found)
      saveScannedToLS()
    }
  } else {
    isScanning.value = false // opcional: detener tras cada lectura
    showModal.value = true ;
    modalData.value = { nombres: '', ci: '', titulo: '' }
    modalTitle.value = 'NO ESTA EN LA LISTA DE INVITADOS'
    modalIcon.value = 'pi pi-times'; // icono de error
    modalMessage.value = 'SIN INVITACION'
    modalIconColor.value = 'text-red-500' 
  }
}

// ------- iniciar/ detener scanner -------
async function startScanner() {
  if (isScanning.value) return
  const qrRegionId = 'reader'
  // instancia Html5Qrcode con id del contenedor
  html5QrcodeScanner = new Html5Qrcode(qrRegionId, /* verbose= */ false)
  const config = { fps: 10, qrbox: 250 }
  try {
    const cameraId = selectedCameraId.value || (cameras.value[0] && cameras.value[0].id)
    if (!cameraId) {
      alert('No se detectó cámara disponible.')
      return
    }
    await html5QrcodeScanner.start(
    cameraId,
    config,
    (decodedText, decodedResult) => {
      // Al detectar: ejecutar handler y opcionalmente parar por un momento para evitar lecturas repetidas
      onScanSuccess(decodedText, decodedResult)
      isScanning.value = false
      // No detenemos para permitir múltiples lecturas, pero podrías pausar si lo deseas
    },
    (errorMessage) => {
      //fallos de lectura (opcional)
      //console.log('parse error', errorMessage)
    }
    )
    isScanning.value = true
  } catch (err) {
    console.error('Error iniciando scanner', err)
    alert('Error iniciando la cámara: ' + err)
  }
}

async function stopScanner() {
  if (!isScanning.value || !html5QrcodeScanner) return
  try {
    await html5QrcodeScanner.stop()
    await html5QrcodeScanner.clear()
  } catch (e) {
    console.warn('Error deteniendo scanner', e)
  } finally {
    isScanning.value = false
    html5QrcodeScanner = null
  }
}

// borrar almacenados
function clearScanned() {
  if (!confirm('¿Borrar todos los escaneados guardados en localStorage?')) return
  scanned.value = []
  scanCounts.value = {}
  saveScannedToLS()
}


// Modal handlers
async function handleCloseModal() {
  showModal.value = false
  modalData.value = null
  modalMessage.value = ''
  // Si el escáner estaba detenido, lo reanudamos
  if (!isScanning.value) {
    await startScanner();
  }
}

// obtener cámaras disponibles
async function listCameras() {
  try {
    const devices = await Html5Qrcode.getCameras()
    cameras.value = devices.map(d => ({ id: d.id, label: d.label || d.id }))
    console.log('Cámaras detectadas:', cameras.value)
    if (cameras.value.length) selectedCameraId.value = cameras.value[0].id
  } catch (e) {
    console.warn('No se pudieron listar cámaras', e)
    cameras.value = []
  }
}

// ciclo de vida
onMounted(async () => {
  loadScannedFromLS()
  await listCameras()
  var cantCameras = cameras.value.length-1;
  selectedCameraId.value = cameras.value[cantCameras].id;
})

onBeforeUnmount(() => {
  stopScanner()
})
</script>