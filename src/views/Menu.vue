<script setup>
/*import { ref, onMounted } from 'vue'; 
    import { useToast } from 'primevue/usetoast';
    const toast = useToast();

    import { app, db } from "../service/firebaseConfig.js";
    import {collection ,getDocs,getDoc, query, doc, addDoc } from "firebase/firestore"; 
    import {validateFields} from "../assets/validators.js"

    const categoryItems = ref([]);
    const sizeItems = ref([]);
    const statusItems = ref([
        {name: "Disponible"},
        {name: "No Disponible"},
        ]);

    const menuModel = ref({
        name: "",
        desc: "",
        price: "",
        category: null,
        size: "",
        status: "",
        ingredients: ""
    })

    const clearMenuModel = () => {
      menuModel.value = {
        name: "",
        desc: "",
        price: "",
        category: null,
        size: "",
        status: "",
        ingredients: ""
    };
};

//  CONSULTAR CATERGORIAS
onMounted(async () => {
    const query = await getDocs(collection(db, "categories"));
    const data = query.docs.map((doc) =>{
      return {id: doc.id, ...doc.data()};
  });
    categoryItems.value = data;
        //console.log(data)
});


    //CONSULTAR TAMAÑOS
onMounted(async () => {
    const query = await getDocs(collection(db, "sizes"));
    const data = query.docs.map((doc) =>{
      return {...doc.data()};
  });
    sizeItems.value = data;
       //console.log(data)
});




const reglasValidacion = {
  nombre: { required: true, tipo: 'string' },
  cedula: { required: true, tipo: 'number', pattern: /^\d+$/ },
};

const validateForm = () => {
    const requiredFields = ['name', 'desc', 'price', 'category', 'size', 'status'];

    let val = validateFields(menuModel.value, requiredFields)
    return val;
};







// Add a new document in collection "menu"
const saveMenuItem = async (e)=>{

    if(validateForm(menuModel.value, )==true){ 
        const categoryId = menuModel.value.category.id;
        const sizeName = menuModel.value.size.name;
        const statusName = menuModel.value.status.name;
        menuModel.value.status = statusName;
        menuModel.value.category = categoryId;
        menuModel.value.size = sizeName;
        menuModel.value.price = parseFloat(menuModel.value.price);

        //const saveDoc = await addDoc(collection(db, "menu"), menuModel.value );
        //clearMenuModel();
        //console.log("Document written with ID: ", saveDoc.id);
        toast.add({ severity: 'success', summary: 'Exito', detail: 'Los datos se han guardado.', life: 3000 });
    }else{
        toast.add({ severity: 'error', summary: 'Error', detail: 'Por favor, complete todos los campos.', life: 3000 });
    }
}; 
*/
</script>

<template>
    <!--
    <div class="grid">
        <Toast/>
        <div class="col-12">
            <div class="card">
                <h5>Agregar al menu</h5>
                <form >

                    <div class="p-fluid formgrid grid">
                        <div class="field col-12 md:col-6">
                            <label for="name">Nombre</label>
                            <InputText v-model="menuModel.name" id="name" type="text"  placeholder="Ej. Empanada" />
                        </div>

                        <div class="field col-12 md:col-6">
                            <label for="desc">Detalle</label>
                            <InputText v-model="menuModel.desc" id="desc" type="text"  placeholder="Ej. Especial" />
                        </div>
                    
                    <div class="field col-12">
                        <label for="address">Address</label>
                        <InputText id="address" rows="4" />
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="city">City</label>
                        <InputText id="city" type="text" />
                    </div>

                    <div class="field col-12 md:col-3">
                        <label for="price">Precio</label>
                        <InputNumber v-model="menuModel.price" id="price" placeholder="Ej. 5.00"  mode="currency" currency="USD" locale="en-US"/>
                    </div>

                    <div class="field col-12 md:col-3">
                        <label for="categories">Categoria</label>
                        <Dropdown v-model="menuModel.category" id="categories" :options="categoryItems" optionLabel="name" placeholder="Seleccione una..."></Dropdown>
                    </div>

                    <div class="field col-12 md:col-3">
                        <label for="size">Tamaño</label>
                        <Dropdown v-model="menuModel.size" id="size" :options="sizeItems" optionLabel="name" placeholder="Seleccione una..."></Dropdown>
                    </div>

                    <div class="field col-12 md:col-3">
                        <label for="status">Status</label>
                        <Dropdown v-model="menuModel.status" id="status" :options="statusItems" optionLabel="name" placeholder="Seleccione una..."></Dropdown>
                    </div>


                    <div class="field col-12 md:col-12">
                        <label for="ingredients">Ingredientes</label>
                        <InputText v-model="menuModel.ingredients" id="ingredients" type="text"  placeholder="Ej. mayonesa, salchicha, tomate" />
                    </div>
                </div>


                <Button @click="saveMenuItem" class="" label="Guardar"  icon="pi pi-check"></Button>
            </form>
        </div>

    </div>

</div>
--></template>

<!--
        <div class="col-12 md:col-6">
            <div class="card p-fluid">
                <h5>Vertical</h5>
                <div class="field">
                    <label for="name1">Name</label>
                    <InputText id="name1" type="text" />
                </div>
                <div class="field">
                    <label for="email1">Email</label>
                    <InputText id="email1" type="text" />
                </div>
                <div class="field">
                    <label for="age1">Age</label>
                    <InputText id="age1" type="text" />
                </div>
            </div>

            <div class="card p-fluid">
                <h5>Vertical Grid</h5>
                <div class="formgrid grid">
                    <div class="field col">
                        <label for="name2">Name</label>
                        <InputText id="name2" type="text" />
                    </div>
                    <div class="field col">
                        <label for="email2">Email</label>
                        <InputText id="email2" type="text" />
                    </div>
                </div>
            </div>
        </div>
        

        <div class="col-12 md:col-6">
            <div class="card p-fluid">
                <h5>Horizontal</h5>
                <div class="field grid">
                    <label for="name3" class="col-12 mb-2 md:col-2 md:mb-0">Name</label>
                    <div class="col-12 md:col-10">
                        <InputText id="name3" type="text" />
                    </div>
                </div>
                <div class="field grid">
                    <label for="email3" class="col-12 mb-2 md:col-2 md:mb-0">Email</label>
                    <div class="col-12 md:col-10">
                        <InputText id="email3" type="text" />
                    </div>
                </div>
            </div>

            <div class="card">
                <h5>Inline</h5>
                <div class="formgroup-inline">
                    <div class="field">
                        <label for="firstname1" class="p-sr-only">Firstname</label>
                        <InputText id="firstname1" type="text" placeholder="Firstname" />
                    </div>
                    <div class="field">
                        <label for="lastname1" class="p-sr-only">Lastname</label>
                        <InputText id="lastname1" type="text" placeholder="Lastname" />
                    </div>
                    <Button label="Submit"></Button>
                </div>
            </div>

            <div class="card">
                <h5>Help Text</h5>
                <div class="field p-fluid">
                    <label for="username">Username</label>
                    <InputText id="username" type="text" />
                    <small>Enter your username to reset your password.</small>
                </div>
            </div>
        </div>-->
