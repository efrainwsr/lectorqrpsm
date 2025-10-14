<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue';
import jsQR from 'jsqr';
import { useLayout } from '@/layout/composables/layout';
import QrScanner from 'qr-scanner';

const { isDarkTheme } = useLayout();
const lineOptions = ref(null);
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

// Simulación de una base de datos de estudiantes
const estudiantesData = [
    {
        nombres: 'Eduardo Jose Gomez Torres ',
        ci: 'V-23.518.217',
        titulo: 'Ing. Civil'
    },
    {
        nombres: 'Fernando Javier Petit Silguera ',
        ci: 'V-29.906.967',
        titulo: 'Ing. Civil'
    },
    {
        nombres: 'Francy Liliana Lopez Daza ',
        ci: 'V-15.211.972',
        titulo: 'Ing. Civil'
    },
    {
        nombres: 'Giorgio Alexander Spano Ortega',
        ci: 'V-9.686.353',
        titulo: 'Ing. Civil'
    },
    {
        nombres: 'Hamilton David Arevalo Padilla ',
        ci: 'V-25.083.534',
        titulo: 'Ing. Civil'
    },
    {
        nombres: 'Irene Dubraska Rodriguez Ojeda   ',
        ci: 'V-28.656.079',
        titulo: 'Ing. Civil'
    },
    {
        nombres: 'Jenifer Yetsebeth Blanco Calzadilla ',
        ci: 'V-24.560.519',
        titulo: 'Ing. Civil'
    },
    {
        nombres: 'Jhon Frederick Cedeño Lugo ',
        ci: 'V-26.909.489',
        titulo: 'Ing. Civil'
    },
    {
        nombres: 'Juan Diego Coronado Vasquez ',
        ci: 'V-28.031.126',
        titulo: 'Ing. Civil'
    },
    {
        nombres: 'Mariannys Josefina Figuera Gonzalez ',
        ci: 'V-25.331.424',
        titulo: 'Ing. Civil'
    },
    {
        nombres: 'Rogehr Hernan Torres Orfila ',
        ci: 'V-27.922.523',
        titulo: 'Ing. Civil'
    },
    {
        nombres: 'Senyasen Dionella Guevara Vargas ',
        ci: 'V-26.562.612',
        titulo: 'Ing. Civil'
    },
    {
        nombres: 'Angel Luis Perdomo Alvarez ',
        ci: 'V-25.647.824',
        titulo: 'Ing. Electricista'
    },
    {
        nombres: 'Claudia Patricia Salazar Pinto ',
        ci: 'V-28.459.211',
        titulo: 'Ing. Electricista'
    },
    {
        nombres: 'Freddy Jose Del Valle Guzman Díaz',
        ci: 'V-19.419.319',
        titulo: 'Ing. Electricista'
    },
    {
        nombres: 'Gerson Jose Guerra Lopez ',
        ci: 'V-26.459.953',
        titulo: 'Ing. Electricista'
    },
    {
        nombres: 'Jackelyn  Skeila Mesia Valbuena ',
        ci: 'V-19.803.839',
        titulo: 'Ing. Electricista'
    },
    {
        nombres: 'Jose Alejandro Yepez Mora ',
        ci: 'V-24.559.712',
        titulo: 'Ing. Electricista'
    },
    {
        nombres: 'Jose Gregorio Martinez Nadales ',
        ci: 'V-9.278.991',
        titulo: 'Ing. Electricista'
    },
    {
        nombres: 'Luis Eduardo Ramos Pinto ',
        ci: 'V-26.332.175',
        titulo: 'Ing. Electricista'
    },
    {
        nombres: 'Manuel Alejandro Peraza  ',
        ci: 'V-20.013.961',
        titulo: 'Ing. Electricista'
    },
    {
        nombres: 'Rafael Jesus Milano Ospedales ',
        ci: 'V-25.744.682',
        titulo: 'Ing. Electricista'
    },
    {
        nombres: 'Rayner Javier Jimenez Nuñez ',
        ci: 'V-22.828.324',
        titulo: 'Ing. Electricista'
    },
    {
        nombres: 'Ronniel Alexander Hernandez Macias ',
        ci: 'V-25.559.576',
        titulo: 'Ing. Electricista'
    },
    {
        nombres: 'Angel Daniel Perez Peña ',
        ci: 'V-20.524.927',
        titulo: 'Ing. Electrónico'
    },
    {
        nombres: 'Kleyzer Fidel Torrealba Gonzalez ',
        ci: 'V-25.446.987',
        titulo: 'Ing. Electrónico'
    },
    {
        nombres: 'Renielis del Carmen Rodriguez Bellorin ',
        ci: 'V-26.649.778',
        titulo: 'Ing. Electrónico'
    },
    {
        nombres: 'Alfonzo Ruben Chung Meza ',
        ci: 'V-19.159.323',
        titulo: 'Ing. Industrial'
    },
    {
        nombres: 'Dayana del Valle Olivero Ferrer ',
        ci: 'V-26.649.654',
        titulo: 'Ing. Industrial'
    },
    {
        nombres: 'Jose Wilmer Amundarain Noriega ',
        ci: 'V-20.202.012',
        titulo: 'Ing. Industrial'
    },
    {
        nombres: 'Leidimar Estefani Malave Astudillo ',
        ci: 'V-26.549.872',
        titulo: 'Ing. Industrial'
    },
    {
        nombres: 'Lisangel Nohemi Caraballo Brito ',
        ci: 'V-26.129.121',
        titulo: 'Ing. Industrial'
    },
    {
        nombres: 'Manuel Ricardo Jose Moya Guevara ',
        ci: 'V-27.733.794',
        titulo: 'Ing. Industrial'
    },
    {
        nombres: 'Nayeri Alexandra Aguilar Rojas ',
        ci: 'V-27.506.313',
        titulo: 'Ing. Industrial'
    },
    {
        nombres: 'Sandra Jacqueline Cumana Rondón ',
        ci: 'V-17.884.530',
        titulo: 'Ing. Industrial'
    },
    {
        nombres: 'Yusleima Patricia Aular Boada ',
        ci: 'V-28.615.682',
        titulo: 'Ing. Industrial'
    },
    {
        nombres: 'Yuwerlin Jose Pérez Parra   ',
        ci: 'V-25.282.431',
        titulo: 'Ing. Industrial'
    },
    {
        nombres: 'Jose Thomas Franco Rodriguez ',
        ci: 'V-27.308.326',
        titulo: 'Ing. de Mantenimiento Mecánico'
    },
    {
        nombres: 'Paulo Cesar Vasquez De Las Salas  ',
        ci: 'V-26.753.491',
        titulo: 'Ing. de Mantenimiento Mecánico'
    },
    {
        nombres: 'Christian Andres Medina Echeverri ',
        ci: 'V-27.644.941',
        titulo: 'Ing. de Sistemas'
    },
    {
        nombres: 'Christopher Daniel Ortiz Muñoz ',
        ci: 'V-27.256.047',
        titulo: 'Ing. de Sistemas'
    },
    {
        nombres: 'José Gabriel Hernández Martínez ',
        ci: 'V-28.162.083',
        titulo: 'Ing. de Sistemas'
    },
    {
        nombres: 'Luis Antonio Lopez Ydrogo ',
        ci: 'V-26.132.286',
        titulo: 'Ing. de Sistemas'
    },
    {
        nombres: 'Michael Jose Aguilera Azocar ',
        ci: 'V-27.935.440',
        titulo: 'Ing. de Sistemas'
    },
    {
        nombres: 'Alberto Enrique Kikushima Lindo',
        ci: 'V-28.694.004',
        titulo: 'Arquitecto'
    },
    {
        nombres: 'Arold Gabriel Garcia Lippay',
        ci: 'V-27.733.689',
        titulo: 'Arquitecto'
    },
    {
        nombres: 'Diana Carolina Lara Brito ',
        ci: 'V-20.807.550',
        titulo: 'Arquitecto'
    },
    {
        nombres: 'Edgar Andrés Caldera Noguez ',
        ci: 'V-28.415.958',
        titulo: 'Arquitecto'
    },
    {
        nombres: 'Enyel Sleyner Diaz Solis ',
        ci: 'V-28.667.118',
        titulo: 'Arquitecto'
    },
    {
        nombres: 'Erick Jose Alejandro Acevedo Rodríguez ',
        ci: 'V-28.475.110',
        titulo: 'Arquitecto'
    },
    {
        nombres: 'Eukaris  Carolina Pinto  Bracho   ',
        ci: 'V-22.812.766',
        titulo: 'Arquitecto'
    },
    {
        nombres: 'Fabiola Nohely Martinez Guzman ',
        ci: 'V-30.366.048',
        titulo: 'Arquitecto'
    },
    {
        nombres: 'Frangee Raysmar Rondón Herrera ',
        ci: 'V-28.272.635',
        titulo: 'Arquitecto'
    },
    {
        nombres: 'Franklin del Carmen Garcia Aliendres ',
        ci: 'V-27.993.845',
        titulo: 'Arquitecto'
    },
    {
        nombres: 'Freinder Jose Sizo Dimas ',
        ci: 'V-28.385.796',
        titulo: 'Arquitecto'
    },
    {
        nombres: 'Gabriela Alejandra Leon Pérez ',
        ci: 'V-27.407.223',
        titulo: 'Arquitecto'
    },
    {
        nombres: 'Gabriela Feria Villahermosa ',
        ci: 'V-16.613.574',
        titulo: 'Arquitecto'
    },
    {
        nombres: 'Gabriela Viviana Yuruani Marquez Lezama ',
        ci: 'V-27.077.411',
        titulo: 'Arquitecto'
    },
    {
        nombres: 'Hind Marianne Assaf Waheb ',
        ci: 'V-26.969.469',
        titulo: 'Arquitecto'
    },
    {
        nombres: 'Juan Gabriel Pérez García ',
        ci: 'V-17.708.948',
        titulo: 'Arquitecto'
    },
    {
        nombres: 'Madelyn del Valle Perdomo Alvarez ',
        ci: 'V-20.495.050',
        titulo: 'Arquitecto'
    },
    {
        nombres: 'Mariely de los Angeles Gascon Reyes ',
        ci: 'V-30.365.923',
        titulo: 'Arquitecto'
    },
    {
        nombres: 'Moises Daniel Moya Camero ',
        ci: 'V-26.359.820',
        titulo: 'Arquitecto'
    },
    {
        nombres: 'Nicole Shantall Paniz Ruiz ',
        ci: 'V-26.676.587',
        titulo: 'Arquitecto'
    },
    {
        nombres: 'Oxana Victoria Plenty Alvarez ',
        ci: 'V-28.675.816',
        titulo: 'Arquitecto'
    },
    {
        nombres: 'Raul Alexander Amaya Sotillo ',
        ci: 'V-27.836.315',
        titulo: 'Arquitecto'
    },
    {
        nombres: 'Stephany Mariely Useche Martínez ',
        ci: 'V-26.676.736',
        titulo: 'Arquitecto'
    },
    {
        nombres: 'Vanecci Carolina Anton Marin ',
        ci: 'V-25.393.182',
        titulo: 'Arquitecto'
    },
    {
        nombres: 'Wesllyn Alejandro Perdomo Dominguez ',
        ci: 'V-28.162.105',
        titulo: 'Arquitecto'
    },
    {
        nombres: 'Yoan Alberto Figuera Gil ',
        ci: 'V-24.037.063',
        titulo: 'Arquitecto'
    },
    {
        nombres: 'Yorgelis Balina González Farfán   ',
        ci: 'V-30.001.282',
        titulo: 'Arquitecto'
    },
    {
        nombres: 'Yorman Alexander Mata Villarroel ',
        ci: 'V-27.293.884',
        titulo: 'Arquitecto'
    }
];

// Referencias reactivas
const videoElement = ref(null);
const isCameraActive = ref(false);
const isLoading = ref(false);
const scannedResult = ref(null);
const validationResult = ref(null);
const scannedCIs = ref([]);
const cameraError = ref(null);
const qrScanner = ref(null);

// Función para extraer la cédula del texto del QR
const extractCIFromQR = (qrText) => {
    if (!qrText) return null;

    const lines = qrText.split('\n');
    for (const line of lines) {
        if (line.toLowerCase().includes('cédula') || line.toLowerCase().includes('cedula')) {
            const parts = line.split(':');
            if (parts.length > 1) {
                return parts[1].trim();
            }
        }
    }
    return null;
};

// Función para buscar estudiante por cédula
const findStudentByCI = (ci) => {
    return estudiantesData.find((estudiante) => estudiante.ci.toLowerCase() === ci.toLowerCase());
};

// Función para validar el resultado del QR
const validateQRResult = (ci) => {
    const estudiante = findStudentByCI(ci);
    const alreadyScanned = scannedCIs.value.includes(ci);

    if (!estudiante) {
        return {
            type: 'error',
            title: '❌ Cédula no encontrada',
            message: 'La cédula escaneada no existe en la base de datos.'
        };
    }

    if (alreadyScanned) {
        return {
            type: 'warning',
            title: '⚠️ Ya escaneado',
            message: 'Esta cédula ya fue escaneada anteriormente.',
            estudiante: estudiante
        };
    }

    // Agregar a la lista de escaneados
    scannedCIs.value.push(ci);

    return {
        type: 'success',
        title: '✅ Válido',
        message: 'Cédula verificada correctamente.',
        estudiante: estudiante
    };
};

// Función para obtener nombre del estudiante
const getStudentName = (ci) => {
    const estudiante = findStudentByCI(ci);
    return estudiante ? estudiante.nombres : 'No encontrado';
};

// Función para manejar el resultado del QR
const handleQRScan = (result) => {
    if (result && result.data) {
        const ci = extractCIFromQR(result.data);

        if (ci) {
            scannedResult.value = ci;
            validationResult.value = validateQRResult(ci);

            // Opcional: detener la cámara después de escanear exitosamente
            setTimeout(() => {
                //stopCamera();
            }, 2000);
        } else {
            scannedResult.value = 'No se pudo extraer la cédula';
            validationResult.value = {
                type: 'error',
                title: '❌ Formato incorrecto',
                message: 'El QR no contiene información de cédula en el formato esperado.'
            };
        }
    }
};

// Función para inicializar el scanner de QR
const initializeQrScanner = async () => {
    try {
        // Importación dinámica para evitar problemas de SSR
        const QrScannerModule = await import('qr-scanner');
        const QrScanner = QrScannerModule.default || QrScannerModule.QrScanner;

        // Esperar a que el elemento de video esté disponible en el DOM
        await nextTick();

        if (!videoElement.value) {
            throw new Error('Elemento de video no encontrado');
        }

        // Configurar el scanner
        qrScanner.value = new QrScanner(videoElement.value, handleQRScan, {
            highlightScanRegion: true,
            highlightCodeOutline: true,
            maxScansPerSecond: 3,
            returnDetailedScanResult: true
        });

        return QrScanner;
    } catch (error) {
        console.error('Error al inicializar QR Scanner:', error);
        throw error;
    }
};

// Función para activar/desactivar cámara
const toggleCamera = async () => {
    if (isCameraActive.value) {
        stopCamera();
    } else {
        await startCamera();
    }
};

// Función para iniciar la cámara
const startCamera = async () => {
    try {
        isLoading.value = true;
        cameraError.value = null;
        scannedResult.value = null;
        validationResult.value = null;

        // Inicializar QR Scanner
        const QrScanner = await initializeQrScanner();

        // Verificar si hay cámara disponible
        const hasCamera = await QrScanner.hasCamera();
        if (!hasCamera) {
            throw new Error('No se encontró una cámara disponible en este dispositivo');
        }

        // Iniciar el scanner
        await qrScanner.value.start();
        isCameraActive.value = true;
    } catch (error) {
        console.error('Error al iniciar cámara:', error);
        cameraError.value = error.message;
        stopCamera();
    } finally {
        isLoading.value = false;
    }
};

// Función para detener la cámara
const stopCamera = () => {
    if (qrScanner.value) {
        try {
            qrScanner.value.stop();
            qrScanner.value.destroy();
        } catch (error) {
            console.warn('Error al detener cámara:', error);
        }
        qrScanner.value = null;
    }
    isCameraActive.value = false;
};

// Función para reintentar la cámara
const retryCamera = async () => {
    cameraError.value = null;
    await startCamera();
};

// Función para limpiar lista de escaneados
const clearScannedList = () => {
    scannedCIs.value = [];
};

// Limpiar al desmontar el componente
onUnmounted(() => {
    stopCamera();
});
</script>

<template>
    <div class="qr-reader-container">
        <h1>Lector de Códigos QR</h1>

        <!-- Botón para activar/desactivar cámara -->
        <button @click="toggleCamera" :class="['camera-btn', { active: isCameraActive }]" :disabled="isLoading">
            {{ isCameraActive ? 'Detener Cámara' : 'Activar Cámara' }}
        </button>

        <!-- Área de video para la cámara -->
        <div class="video-container" v-if="isCameraActive">
            <video ref="videoElement" class="video-preview"></video>
            <div class="scan-overlay"></div>
        </div>

        <!-- Resultados del escaneo -->
        <div class="results-container">
            <div v-if="scannedResult" class="result-card">
                <h3>Resultado del Escaneo:</h3>
                <p><strong>Cédula detectada:</strong> {{ scannedResult }}</p>

                <div v-if="validationResult" :class="['validation-message', validationResult.type]">
                    <h4>{{ validationResult.title }}</h4>
                    <p v-if="validationResult.estudiante">
                        <strong>Nombre:</strong> {{ validationResult.estudiante.nombres }}<br />
                        <strong>Título:</strong> {{ validationResult.estudiante.titulo }}
                    </p>
                    <p>{{ validationResult.message }}</p>
                </div>
            </div>

            <div v-else-if="isCameraActive" class="scanning-message">
                <p>Enfoca el código QR hacia la cámara...</p>
            </div>
        </div>

        <!-- Lista de cédulas ya escaneadas -->
        <div class="scanned-list" v-if="scannedCIs.length > 0">
            <h3>Cédulas Escaneadas ({{ scannedCIs.length }})</h3>
            <ul>
                <li v-for="ci in scannedCIs" :key="ci">{{ ci }} - {{ getStudentName(ci) }}</li>
            </ul>
            <button @click="clearScannedList" class="clear-btn">Limpiar Lista</button>
        </div>
    </div>
</template>

<style scoped>
.qr-reader-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    font-family: Arial, sans-serif;
}

.camera-btn {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 16px;
    margin-bottom: 20px;
}

.camera-btn:hover:not(:disabled) {
    background-color: #0056b3;
}

.camera-btn.active {
    background-color: #dc3545;
}

.camera-btn.active:hover {
    background-color: #c82333;
}

.camera-btn:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
}

.video-container {
    position: relative;
    width: 100%;
    max-width: 500px;
    margin: 0 auto 20px;
    border: 2px solid #007bff;
    border-radius: 8px;
    overflow: hidden;
}

.video-preview {
    width: 100%;
    height: auto;
    display: block;
}

.scan-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: 2px solid #00ff00;
    box-shadow: 0 0 0 1000px rgba(0, 0, 0, 0.3);
    pointer-events: none;
}

.results-container {
    margin: 20px 0;
}

.result-card {
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
}

.scanning-message {
    text-align: center;
    color: #6c757d;
    font-style: italic;
}

.validation-message {
    padding: 15px;
    border-radius: 6px;
    margin-top: 15px;
}

.validation-message.success {
    background-color: #d4edda;
    border: 1px solid #c3e6cb;
    color: #155724;
}

.validation-message.warning {
    background-color: #fff3cd;
    border: 1px solid #ffeaa7;
    color: #856404;
}

.validation-message.error {
    background-color: #f8d7da;
    border: 1px solid #f5c6cb;
    color: #721c24;
}

.scanned-list {
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    padding: 20px;
    margin-top: 20px;
}

.scanned-list ul {
    list-style-type: none;
    padding: 0;
    max-height: 200px;
    overflow-y: auto;
}

.scanned-list li {
    padding: 8px;
    border-bottom: 1px solid #dee2e6;
}

.scanned-list li:last-child {
    border-bottom: none;
}

.clear-btn {
    background-color: #6c757d;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 10px;
}

.clear-btn:hover {
    background-color: #545b62;
}
</style>
