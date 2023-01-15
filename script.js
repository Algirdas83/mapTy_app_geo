'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');




class App{

    #map;
    #mapEvent;

    constructor(){
        this._getPosition()

        inputType.addEventListener('change',this._toggelElevationField )
        form.addEventListener('submit', this._newWorkout.bind(this))
           
    }




    //Methods
    _getPosition(){
        if(navigator.geolocation)
        navigator.geolocation.getCurrentPosition( this._loadMap.bind(this) ,function(){
            alert('Jusu dabartine vieta nepasiekiama')} ) 
    }

    _loadMap(position){
        
            const {latitude, longitude} = position.coords
            const coords = [latitude, longitude]
    
             this.#map = L.map('map').setView(coords, 14);
                L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(this.#map);
              
                 // Event (on) for handling clicks on map
                 this.#map.on('click', this._showForm.bind(this) )
                
    }

    _showForm(mapE){
        this.#mapEvent = mapE
        form.classList.remove('hidden')
        inputDistance.focus()  
    }

    _toggelElevationField(){
       
         inputElevation.closest('.form__row').classList.toggle('form__row--hidden')
         inputCadence.closest('.form__row').classList.toggle('form__row--hidden')
    
    }

    _newWorkout(e){
        // console.log('newWorkout',this);
        e.preventDefault()
        inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = ''
        //Display marker
        const {lat, lng} =this.#mapEvent.latlng
                                
        L.marker([lat, lng])
        .addTo(this.#map)
        .bindPopup(
            L.popup({
            maxWidth: 200,
            minWidth: 100, 
            autoClose: false, 
            closeOnClick: false,
            className:'running-popup',
            }))
            .setPopupContent('treniruote')
        .openPopup();
    }
}


 const app = new App()



