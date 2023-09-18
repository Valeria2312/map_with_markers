const formInputs = document.querySelector(".formInputs");
const markerList = document.querySelector(".marker-list");
const filterInput = document.getElementById('applyFilter');
const filterText = document.getElementById('filterText');
let arrObjects = JSON.parse(localStorage.getItem('arrObjects')) || [];
let arrMarkers = JSON.parse(localStorage.getItem('arrMarkers')) || [];

let currentObg = {}
let map = L.map('map').setView([51.505, -0.09], 13);
let marker;
// Замените URL-адрес тайлового слоя на Google Maps
L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
    maxZoom: 19,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'], // Добавьте поддомены Google Maps
    attribution: '&copy; <a href="https://www.google.com/maps">Google Maps</a>',
}).addTo(map);

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


arrObjects?.forEach((item, index) => {
    let marker;
    if(item.color) {
        const myIcon = L.divIcon({ className: 'custom-icon',
            html: `<div style="background-color: ${item.color}; width: 100%; height: 100%" class="marker-pin"></div>`,});
        marker = L.marker([item.lat, item.lng], { draggable: true, icon: myIcon }).addTo(map);
    } else {
        marker = L.marker([item.lat, item.lng], { draggable: true}).addTo(map);
    }

    marker.on('dragend', (event) => {
        const newLat = event.target.getLatLng().lat;
        const newLng = event.target.getLatLng().lng;
        arrObjects[index].lat = newLat;
        arrObjects[index].lng = newLng;
        localStorage.setItem('arrObjects', JSON.stringify(arrObjects));
    });

    const markerText = `Type: ${item.type}<br>Name: ${item.name}<br>Description: ${item.description}`;
    marker.bindTooltip(markerText).openTooltip();
    createListItem()
})


const getValueInputs = () => {
    const addInfo = document.querySelector(".inputs");
    const type = addInfo.querySelector('[name="type"]').value;
    const name = addInfo.querySelector('[name="name"]').value;
    const description = addInfo.querySelector('[name="description"]').value;
    const color = addInfo.querySelector('[name="color"]').value;
    currentObg.type = type;
    currentObg.name = name;
    currentObg.description = description;
    currentObg.color = color;
    const markerText = `Type: ${type}<br>Name: ${name}<br>Description: ${description}`;
    if(color) {
        const myIcon = L.divIcon({ className: 'custom-icon',
            html: `<div style="background-color: ${color};" class="marker-pin"></div>`,});
        console.log(myIcon)
        marker = L.marker([currentObg.lat, currentObg.lng], { draggable: true, icon: myIcon}).addTo(map);
    } else {
        marker = L.marker([currentObg.lat, currentObg.lng], { draggable: true }).addTo(map);
    }

    marker.on('dragend', (event) => {
        currentObg.lat = event.target.getLatLng().lat;
        currentObg.lng = event.target.getLatLng().lng;
    });
    const markerInfo = {
        lat: currentObg.lat,
        lng: currentObg.lng,
        color: currentObg.color,
    };
    arrMarkers.push(markerInfo);
    localStorage.setItem('arrMarkers', JSON.stringify(arrMarkers));
    arrObjects.push(currentObg);
    localStorage.setItem('arrObjects', JSON.stringify(arrObjects));
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
    <input name="color" placeholder="Введите желаемый цвет">
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
        map.removeLayer(arrMarkers[index]); // Удаляем маркер с карты
        arrObjects.splice(index, 1);
        arrMarkers.splice(index,1)
        localStorage.setItem('arrObjects', JSON.stringify(arrObjects));
        localStorage.setItem('arrMarkers', JSON.stringify(arrMarkers));
        createListItem();
    }
}


const onMapClick = (e) => {
    formInputs.innerHTML = createInputs()
    const object = {};
    object.lat = e.latlng.lat;
    object.lng = e.latlng.lng;
    currentObg = object;
    createInfo()
}

map.on('click', onMapClick);


const filterMarkers = () => {
    const filter = filterText.value.toLowerCase();
    const filterArr = arrObjects.filter((markerInfo) => {return markerInfo.description.indexOf(filter) !== -1
    })

    map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });

    filterArr?.forEach((item, index) => {
        let marker;
        if (item.color) {
            const myIcon = L.divIcon({
                className: 'custom-icon',
                html: `<div style="background-color: ${item.color}; width: 100%; height: 100%" class="marker-pin"></div>`,
            });
            marker = L.marker([item.lat, item.lng], {draggable: true, icon: myIcon}).addTo(map);
        } else {
            marker = L.marker([item.lat, item.lng], {draggable: true}).addTo(map);
        }

        marker.on('dragend', (event) => {
            const newLat = event.target.getLatLng().lat;
            const newLng = event.target.getLatLng().lng;
            arrObjects[index].lat = newLat;
            arrObjects[index].lng = newLng;
            localStorage.setItem('arrObjects', JSON.stringify(arrObjects));
        });

        const markerText = `Type: ${item.type}<br>Name: ${item.name}<br>Description: ${item.description}`;
        marker.bindTooltip(markerText).openTooltip();
    })
}

filterInput.addEventListener("click", filterMarkers)
