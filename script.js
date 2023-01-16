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




/////////////////// Classes
class Workout {
    
    date = new Date()
    id = (Date.now() + '').slice(-10)
    
    constructor(coords ,distance, duration)
    {

        //this.date = ...
        //this.id = ...
        this.coords = coords // [lat, lng]
        this.distance = distance //km
        this.duration = duration //min
        
    }
 }


 class Running extends Workout{
   
    type = 'running'
    constructor(coords ,distance, duration, cadance ){
        super(coords,distance, duration)
        this.cadance = cadance
        this.calcPace()
        
    }
    calcPace(){
        this.pace = this.duration / this.distance
        return this.pace
    }
 }


 class Cysling extends Workout {
    type = 'cycling'
    constructor(coords ,distance, duration, elevationGain){
        super(coords,distance, duration)
        this.elevationGain = elevationGain
        this.calcSpeed()

    }

    calcSpeed(){
        this.speed = this.distance / (this.duration / 60)
        return this.speed
    }
 }


 

/////////////////////////////////
//Application Architecture//////
class App {

    #map;
    #mapEvent;
    #workouts = []

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
        //Hellper methods
        const validInputs = (... inputs) => 
        inputs.every(inp => Number.isFinite(inp))
        const allPositive = (...inputs) => inputs.every(inp => inp > 0)
        
        //////////////////////
        e.preventDefault()
        
        
        // Get data from the  form 

        const type = inputType.value
        const distance = +inputDistance.value
        const duration = +inputDuration.value
        
        const {lat, lng} =this.#mapEvent.latlng
        let workout;

        //If workout runnig , creat runnig object
        if(type === 'running'){
            const cadance = +inputCadence.value
     
            if(!validInputs(distance, duration, cadance) || !allPositive(distance, duration, cadance) )
            return alert('Inputs have to bee positive numbers')
            //coords ,distance, duration, cadance
             workout = new Running([lat, lng],distance, duration, cadance  )
          
        }

        //If workout cycling , creat cycling object
        if(type === 'cycling'){
            const elevation = +inputElevation.value
            
            if(!validInputs(distance, duration, elevation) ||  !allPositive(distance, duration))
            return alert('Inputs have to bee positive numbers')

            workout = new Cysling([lat, lng],distance, duration, elevation  )
        }

        // Add new object to workout array
        this.#workouts.push(workout)
        console.log(workout);
        // Render workout on map as marker

        

        //Display marker
      
         this.renderWorkoutMarker(workout)                       
       

        //render new workout on the list


        //Hide the from and clear the input fields
        inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = ''
      
    }

    renderWorkoutMarker (workout){

        
        
        L.marker(workout.coords)
        .addTo(this.#map)
        .bindPopup(
            L.popup({
            maxWidth: 200,
            minWidth: 100, 
            autoClose: false, 
            closeOnClick: false,
            className: `${workout.type}-popup`,
            }))
            .setPopupContent('workout.distance')
        .openPopup();
    }
}


 const app = new App()


 
