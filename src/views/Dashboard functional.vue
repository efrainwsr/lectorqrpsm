<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import jsQR from 'jsqr';
import { useLayout } from '@/layout/composables/layout';
const visible = ref(false);
const finded = ref({});
const modalHead = ref('GRADUANDO VERIFICADO ✔️');

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

// Variables reactivas
const video = ref(null);
const notificationMessage = ref('');
const notificationClass = ref('');
const ESCANEADOS_KEY = 'escaneados_qr';
const escaneados = ref(new Set());

// Cargar escaneados desde localStorage al iniciar
onMounted(() => {
    const saved = localStorage.getItem(ESCANEADOS_KEY);
    if (saved) {
        try {
            const arr = JSON.parse(saved);
            if (Array.isArray(arr)) {
                escaneados.value = new Set(arr);
            }
        } catch (e) {
            // Si hay error, ignorar y dejar Set vacío
        }
    }
    startScanner();
});

// Guardar escaneados en localStorage cada vez que cambian
watch(
    escaneados,
    (val) => {
        localStorage.setItem(ESCANEADOS_KEY, JSON.stringify(Array.from(val)));
    },
    { deep: true }
);
let videoStream = null;
const isPaused = ref(false);

// Métodos
const showNotification = (message, type) => {
    notificationMessage.value = message;
    notificationClass.value = type;
};

const handleQRCode = (data) => {
    if (isPaused.value || visible.value) return;
    isPaused.value = true;
    const cedulaRegex = /ci:\s*([VvEe]-\d{1,2}\.\d{3}\.\d{3}|\d+)/i;
    const match = data.match(cedulaRegex);
    //console.log(data);

    let studentCI = null;

    if (match && match[1]) {
        // Si la cédula tiene el formato V-XX.XXX.XXX, la limpiamos a solo números
        studentCI = match[1];
        //stopScanner();
        //console.log(studentCI);
    } else {
        // Si no coincide con el patrón, asumimos que el QR contiene solo la cédula
        studentCI = data.trim();
    }

    const estudianteEncontrado = estudiantesData.find((estudiante) => estudiante.ci === studentCI);
    //console.log("Estudiante encontrado:", estudianteEncontrado);
    if (estudianteEncontrado) {
        if (escaneados.value.has(studentCI)) {
            console.log(escaneados.value);
            isPaused.value = true;
            modalHead.value = 'GRADUANDO YA ESCANEADO ⚠️';
            visible.value = true;
            finded.value = {
                nombre: estudianteEncontrado.nombres,
                ci: estudianteEncontrado.ci,
                titulo: estudianteEncontrado.titulo
            };
            // Apaga la cámara
            /*setTimeout(() => {
        visible.value = false;
        isPaused.value = false;
        //startScanner(); // Reinicia la cámara
      }, 2000); // Limpiar notificación después de 2 segundos*/
        } else {
            isPaused.value = true;
            escaneados.value.add(studentCI);
            //const nombre = estudianteEncontrado.nombres;
            modalHead.value = 'GRADUANDO VERIFICADO ✔️';
            finded.value = {
                nombre: estudianteEncontrado.nombres,
                ci: estudianteEncontrado.ci,
                titulo: estudianteEncontrado.titulo
            };
            visible.value = true;

            /*setTimeout(() => {
        visible.value = false;
        isPaused.value = false;
        //startScanner(); // Reinicia la cámara
      }, 2000); // Limpiar notificación después de 2 segundos*/
        }
    } else {
        showNotification('Estudiante no encontrado. ⚠️', 'error');
    }
};

const tick = () => {
    if (isPaused.value) {
        requestAnimationFrame(tick);
        return;
    }
    if (video.value && video.value.readyState === video.value.HAVE_ENOUGH_DATA) {
        const canvas = document.createElement('canvas');
        canvas.height = video.value.videoHeight;
        canvas.width = video.value.videoWidth;
        const context = canvas.getContext('2d');
        context.drawImage(video.value, 0, 0, canvas.width, canvas.height);

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert'
        });

        if (code) {
            handleQRCode(code.data);
        }
    }
    requestAnimationFrame(tick);
};

const startScanner = async () => {
    try {
        videoStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (video.value) {
            video.value.srcObject = videoStream;
            video.value.setAttribute('playsinline', true);
            video.value.play();
            tick();
        }
    } catch (err) {
        console.error('No se pudo acceder a la cámara:', err);
        showNotification('Error: No se pudo acceder a la cámara. Asegúrate de dar los permisos.', 'error');
    }
};

const stopScanner = () => {
    if (videoStream) {
        videoStream.getTracks().forEach((track) => track.stop());
    }
};

// Ciclos de vida del componente
onMounted(() => {
    startScanner();
});

onBeforeUnmount(() => {
    stopScanner();
});
</script>

<template>
    <div id="app">
        <h1>Escaner de invitaciones de grado</h1>
        <video ref="video" id="qr-video"></video>
        <!-- <div :class="notificationClass" id="notification-box">{{ notificationMessage }}</div>-->
    </div>

    <Dialog v-model:visible="visible" modal :header="modalHead" :style="{ width: '25rem' }">
        <span class="text-surface-500 dark:text-surface-400 block mb-2">{{ finded.nombre }}</span>
        <span class="text-surface-500 dark:text-surface-400 block mb-2">{{ finded.ci }}</span>
        <span class="text-surface-500 dark:text-surface-400 block mb-2">{{ finded.titulo }}</span>

        <div class="flex justify-end gap-2">
            <Button
                type="button"
                label="Cerrar"
                severity="secondary"
                @click="
                    () => {
                        visible = false;
                        isPaused = false;
                        startScanner();
                    }
                "
            ></Button>
        </div>
    </Dialog>
</template>

<style scoped>
#qr-video {
    width: 420px;
    height: 500px;
    object-fit: cover;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
    display: block;
    margin: 0 auto 1rem auto;
}
</style>
