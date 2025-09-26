<template>
  <div class="container">
    <h1>Escáner QR - Estudiantes</h1>

  <div class="controls">
      <label for="cameraSelect">Seleccionar cámara:</label>
      <Select id="cameraSelect" v-model="selectedCameraId">
        <option v-for="cam in cameras" :key="cam.id" :value="cam.id">
          {{ cam.label }}
        </option>
      </Select>
  </div>

    <!--<div class="card flex justify-center">
        <Select v-model="selectedCameraId" :options="cameras.id" :optionLabel="cameras.label" placeholder="Select a City" checkmark :highlightOnSelect="false" class="w-full md:w-56"></Select>
    </div>-->

    <div class="controls flex justify-center">
      <Button @click="startScanner" severity="success" :disabled="isScanning" class="mx-1">Iniciar</Button>
      <Button @click="stopScanner" severity="warning" :disabled="!isScanning" class="mx-1">Detener</Button>
      <Button @click="clearScanned" severity="danger" class="mx-1">Borrar almacenados</Button>
    </div>

    <div id="reader" style="width: 500px; max-width: 100%; margin-top: 1rem; margin-bottom: 1rem;"></div>

    <div class="card flex justify-center">
      <span class="text-surface-500 dark:text-surface-400 block mb-2"></span>
      <div v-if="scanned.length">
        <div v-for="s in scanned" :key="s.ci">
          <Button  class="mb-1 " severity="success">{{ s.nombres }} — {{ s.ci }} — {{ s.titulo }}</Button>
        </div>
      </div>
      <p v-else>No hay escaneados aún.</p>
    </div>

     <!--<div class="card flex justify-center">
        <VirtualScroller :items="scanned" :itemSize="50" class="border border-surface-200 dark:border-surface-700 rounded" style="width: 650px; height: 200px">
            <template v-slot:item="{ item, options }">
                <div :class="['flex items-center p-1', { 'bg-surface-100 dark:bg-surface-700': options.odd }]" style="height: 20px">{{ item.ci.toUpperCase()+ ' - ' + item.nombres.toUpperCase()+ ' - ' + item.titulo.toUpperCase() }}</div>
            </template>
        </VirtualScroller>
    </div>-->



    <!-- Modal -->

    <Dialog v-model:visible="showModal" modal :header="modalTitle" :style="{ width: '25rem' }">
            <span class="text-surface-500 dark:text-surface-400 block mb-2">{{ modalData.nombres.toUpperCase() }}</span>
            <span class="text-surface-500 dark:text-surface-400 block mb-2">{{ modalData.ci.toUpperCase() }}</span>
            <span class="text-surface-500 dark:text-surface-400 block mb-2">{{ modalData.titulo.toUpperCase() }}</span>
      
      <div class="flex justify-end gap-2">
  <Button type="button" label="Cerrar" severity="secondary" @click="handleCloseModal"></Button>
      </div>
        </Dialog>


    <!--<div class="modal-backdrop" v-if="showModal" @click.self="closeModal">
      <div class="modal">
        <button class="close" @click="closeModal">×</button>
        <h3>{{ modalTitle }}</h3>
        <div v-if="modalData">
          <p><strong>Nombres:</strong> {{ modalData.nombres }}</p>
          <p><strong>CI:</strong> {{ modalData.ci }}</p>
          <p><strong>Título:</strong> {{ modalData.titulo }}</p>
          <p v-if="modalMessage"><em>{{ modalMessage }}</em></p>
        </div>
        <div v-else>
          <p>{{ modalMessage }}</p>
        </div>
      </div>
    </div> -->

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
//const estudiantesData = ref([])

const scanned = ref([]) // desde localStorage

// Modal
const showModal = ref(false)
const modalData = ref(null)
const modalMessage = ref('')
const modalTitle = ref('')

// Key localStorage
const LS_KEY = 'scannedStudents'

// ------- util: cargar/alamacenar LS -------
function loadScannedFromLS() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    scanned.value = raw ? JSON.parse(raw) : []
  } catch (e) {
    console.error('Error parseando localStorage', e)
    scanned.value = []
  }
}
function saveScannedToLS() {
  localStorage.setItem(LS_KEY, JSON.stringify(scanned.value))
}

// ------- función para parsear texto QR y extraer CI -------
function extractCIFromText(text) {
  // Normalize and try to find a line that contains "ci"
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
  // 1) buscar etiquetas "ci:" o "ci"
  for (const l of lines) {
    const m = l.match(/ci[:\s-]*([A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9\.\-\,]+)/i)
    if (m && m[1]) {
      return normalizeCI(m[1])
    }
  }
  // 2) fallback: buscar patrón tipo V-15.211.972 o E-12345678
  const fallback = text.match(/[A-Za-z]-\d[\d\.\,]*/g)
  if (fallback && fallback.length) {
    return normalizeCI(fallback[0])
  }
  // 3) intentar buscar palabras que empiecen por V o E seguidas de guion y dígitos
  const any = text.match(/\b[VvEePp]\-?[\d\.\,]{5,}\b/)
  if (any) return normalizeCI(any[0])

  return null
}

function normalizeCI(ci) {
  // limpiar espacios y comas, convertir letras a mayúscula, mantener puntos y guiones
  return ci.replace(/\s+/g, '').replace(/,/g, '.').toUpperCase()
}

// ------- manejador onScan -------
async function onScanSuccess(decodedText, decodedResult) {
  stopScanner()
  isScanning.value = false
  // decodedText puede tener contenido multiline
  console.log('QR detectado:', decodedText)
  const extracted = extractCIFromText(decodedText)
  if (!extracted) {
    modalTitle.value = 'QR leído — Formato desconocido'
    modalData.value = null
    modalMessage.value = 'No se pudo extraer la CI del código QR.'
    showModal.value = true
    return
  }

  // Buscar en estudiantesData
  // Normalizar los CI en estudiantesData para comparar
  const found = estudiantesData.find(s => normalizeCI(s.ci) === extracted)
  console.log(found)

  if (found) {
     // opcional: detener tras cada lectura exitosa
    // Verificar si ya está en scanned (localStorage)
    const already = scanned.value.find(s => normalizeCI(s.ci) === extracted)
    modalTitle.value = already ? 'GRADUANDO YA ESCANEADO ⚠️' : 'GRADUANDO VERIFICADO ✔️'
    modalData.value = found
    //modalMessage.value = already ? 'GRADUANDO YA ESCANEADO ⚠️' : 'Persona registrada y almacenada.'
    showModal.value = true

    if (!already) {
      scanned.value.push(found)
      saveScannedToLS()
    }
  } else {
    isScanning.value = false // opcional: detener tras cada lectura
    modalTitle.value = 'No encontrado'
    modalData.value = { nombres: '—', ci: extracted, titulo: '—' }
    modalMessage.value = 'La CI no coincide con la lista de estudiantes.'
    showModal.value = true
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
        // fallos de lectura (opcional)
        // console.log('parse error', errorMessage)
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

// lifecycle
onMounted(async () => {
  loadScannedFromLS()
  await listCameras()
  var cantCameras = cameras.value.length-1;

  //if(cantCameras === 1){
   // selectedCameraId.value = cameras.value[0].id

  //}else if(cantCameras > 1){
    selectedCameraId.value = cameras.value[cantCameras].id;
  //}

  //console.log(selectedCameraId.value);
  //estudiantesData.value = await getEstudentsData()
  //console.log('Datos de estudiantes cargados:', estudiantesData.value)
})

onBeforeUnmount(() => {
  stopScanner()
})
</script>







<style scoped>
/*
.container {
  max-width: 900px;
  margin: 24px auto;
  padding: 12px;
  font-family: Arial, sans-serif;
}

.controls {
  display:flex;
  gap:8px;
  align-items:center;
  flex-wrap:wrap;
}

.scanned-list {
  margin-top: 1rem;
  border-top: 1px solid #ddd;
  padding-top: 1rem;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display:flex;
  align-items:center;
  justify-content:center;
  z-index: 9999;
}

.modal {
  background: #fff;
  padding: 18px;
  border-radius: 8px;
  width: 90%;
  max-width: 420px;
  position: relative;
  box-shadow: 0 6px 20px rgba(0,0,0,0.2);
}

.close {
  position:absolute;
  right:8px;
  top:6px;
  border: none;
  background: transparent;
  font-size: 22px;
  cursor:pointer;
}

button {
  padding: 8px 12px;
  cursor:pointer;
}*/
</style>
