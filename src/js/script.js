const formInputs = document.querySelector(".formInputs");
const markerList = document.querySelector(".marker-list");
let arrObjects = [];
let arrMarkers = [];

let map = L.map('map').setView([51.505, -0.09], 13);
let marker;
// Замените URL-адрес тайлового слоя на Google Maps
L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
    maxZoom: 19,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'], // Добавьте поддомены Google Maps
    attribution: '&copy; <a href="https://www.google.com/maps">Google Maps</a>',
}).addTo(map);


const getValueInputs = () => {
    const currentObg = arrObjects[arrObjects.length - 1];
    const addInfo = document.querySelector(".inputs");
    const type = addInfo.querySelector('[name="type"]').value;
    const name = addInfo.querySelector('[name="name"]').value;
    const description = addInfo.querySelector('[name="description"]').value;
    currentObg.type = type;
    currentObg.name = name;
    currentObg.description = description;
    const markerText = `Type: ${type}<br>Name: ${name}<br>Description: ${description}`;
    marker = L.marker([currentObg.lat, currentObg.lng], { draggable: true }).addTo(map);

    marker.on('dragend', (event) => {

        currentObg.lat = event.target.getLatLng().lat;
        currentObg.lng = event.target.getLatLng().lng;
    });
    arrMarkers.push(marker);
    arrObjects.push(currentObg);
    marker.bindTooltip(markerText).openTooltip()
    createListItem()
    formInputs.innerHTML = "";
}
const createInfo = () => {
    const button = document.querySelector(".inputs button")
    button.addEventListener("click",  getValueInputs)
}
const createInputs = () => {
  return `<div class="inputs">Введите информацию об объекте 
    <input name="type" placeholder="Введите тип" />
    <input name="name" placeholder="Введите название" />
    <input name="description" placeholder="Введите описание" />
    <button>Добавить</button>
    </div>`
}

const editItem = (index) => {

    if (index >= 0 && index < arrObjects.length) {
        const currentObg = arrObjects[index];
        formInputs.innerHTML = createInputs();

        const addInfo = document.querySelector(".inputs");
        addInfo.querySelector('[name="type"]').value = currentObg.type;
        addInfo.querySelector('[name="name"]').value = currentObg.name;
        addInfo.querySelector('[name="description"]').value = currentObg.description;

        const saveButton = document.createElement("button");
        saveButton.textContent = "Сохранить";
        saveButton.addEventListener("click", () => {

            const type = addInfo.querySelector('[name="type"]').value;
            const name = addInfo.querySelector('[name="name"]').value;
            const description = addInfo.querySelector('[name="description"]').value;

            currentObg.type = type;
            currentObg.name = name;
            currentObg.description = description;

            const markerText = `Type: ${type}<br>Name: ${name}<br>Description: ${description}`;
            arrMarkers[index].setTooltipContent(markerText);

            formInputs.innerHTML = "";
            createListItem();
        });
        addInfo.appendChild(saveButton);
    }
}
const deleteListItem = (index) => {
    if (index >= 0 && index < arrObjects.length) {

        map.removeLayer(arrMarkers[index]);

        arrObjects.splice(index, 1);

        createListItem();
    }
}
const createListItem = () => {
    markerList.innerHTML = ''
    arrObjects.forEach((marker, index) => {
      const li = document.createElement("li");
      li.value = ++index;
      li.textContent = marker.name;

      const btnDelete = document.createElement('button');
      btnDelete.textContent = "Удалить";
      btnDelete.className = "delete-marker-button";

      const btnEdit = document.createElement("button");
      btnEdit.textContent = "Редактировать";
      btnEdit.className = "edit-marker-button";
      li.append(btnDelete)
      li.append(btnEdit)
      markerList.append(li);

        btnDelete?.addEventListener("click",() => {
            deleteListItem(index - 1); // Вызов deleteListItem с индексом маркера
        });
        btnEdit?.addEventListener("click", () => {editItem(index - 1)})

  })
}

const onMapClick = (e) => {
    formInputs.innerHTML = createInputs()
    const object = {};
    object.lat = e.latlng.lat;
    object.lng = e.latlng.lng;
    console.log(object)
    createInfo()
    arrObjects.push(object);
}

map.on('click', onMapClick);
