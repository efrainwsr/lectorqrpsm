<script setup>
    defineProps({
        nombre: String,
        precio: Number,
        precioBs: Number,
        cant: Number,
        cat: Number,
        sumarFunc: Function,
        restarFunc: Function,
        i: Number
    });
</script>

<template>

    <div class="col-12 lg:col-6 xl:col-4">
        <div class="card padding-1rem">  
            <div class="flex justify-content-between mb-1">

                <div>
                    <span class="block text-500 font-lg mb-2 font-semibold" :class="{
                        'text-orange-400' : cat.name === 'hamburguesa',
                        'text-green-300' : cat.name === 'perro',
                        'text-yellow-600' : cat.name === 'empanda',
                        'text-pink-300' : cat.name === 'especiales',
                        'text-black-600' : cat.name === '',
                        'text-cyan-600' : cat.name === 'bebida'
                    }">{{ nombre.toUpperCase() }}</span>
                    <div class="inline text-900 font-medium mr-4">$ {{ precio }}</div>
                    <div class="inline text-900 font-medium ">Bs. {{ precioBs}}</div>
                </div>
                <div class="flex align-items-center justify-content-center border-round" style="width: 2.5rem; height: 2.5rem">
                    <Button @click="cant<=0 ? 'disabled' : restarFunc(i)" icon="pi pi-minus" severity="danger" text/>
                </div>
                <div  class="flex align-items-center justify-content-center border-round" style="width: 2.5rem; height: 2.5rem">
                    <Button @click="sumarFunc(i)" icon="pi pi-plus" severity="success" text/>
                </div>
            </div>
            <template v-if="cant >=1">
                <!--<span class="inline text-900 font-medium">Cant. </span>
                <Badge :value="cant" severity='success'></Badge>-->

                <Chip class="pl-0">
                <span class="ml-2 mr-2 font-medium">Cant.</span>
                <span class="text-white bg-gray-500 font-bold border-circle w-2rem h-2rem flex align-items-center justify-content-center">{{cant}}</span>
            </Chip>
            </template>

            
            <!-- :severity=" cant >= 1 ? 'info' : 'danger' -->
            <!-- <div class="inline text-900 font-semibold ">{{ cant}}</div> -->
        </div>
    </div>
</template>


<style>
    .shadow-black{
        box-shadow: 0px 10px 15px -3px rgba(0,0,0,0.1);
    }
    .shadow-cyan{
        box-shadow: 0px 10px 15px -3px #059BB4;
    }
    .padding-1rem{
        padding: 1rem;
    }
    
</style>