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
    clicks = 0
    
    constructor(coords ,distance, duration)
    {

        //this.date = ...
        //this.id = ...
        this.coords = coords // [lat, lng]
        this.distance = distance //km
        this.duration = duration //min
        
        
    }

    _setDescription(){
        this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on  ${months[this.date.getMonth()] } ${this.date.getDay()}`
    }

    click(){
        this.clicks++
    }
 }


 class Running extends Workout{
   
    type = 'running'
    constructor(coords ,distance, duration, cadance ){
        super(coords,distance, duration)
        this.cadance = cadance
        this.calcPace()
        this._setDescription()
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
        this._setDescription()

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
    #mapZoomLevel = 13
    #mapEvent;
    #workouts = []

    constructor(){
        
        this._getPosition()

        inputType.addEventListener('change',this._toggelElevationField )
        form.addEventListener('submit', this._newWorkout.bind(this))
        containerWorkouts.addEventListener('click', this._moveToPopup.bind(this))
           
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
    
             this.#map = L.map('map').setView(coords, this.#mapZoomLevel);
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

    _hideForm(){

        //empty the inputs
        inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = ''
        form.style.display = 'none'
        form.classList.add('hidden')
        setTimeout(() => form.style.display = 'grid', 1000)
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
        //Display marker
         this._renderWorkoutMarker(workout)     
        //render new workout on the list
        this._renderWorkout(workout)   

        //Hide the from and clear the input fields
        this._hideForm()
      
    }

    _renderWorkoutMarker (workout){

        
        
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
            .setPopupContent(`${workout.type === 'running'?'🏃‍♂️': '🚴‍♀️'} ${workout.description}`)
        .openPopup();
    }

    _renderWorkout(workout){

        let html = `<li class="workout workout--${workout.type}" data-id="${workout.id}">
          <h2 class="workout__title"> ${workout.description} </h2>
          <div class="workout__details">
             <span class="workout__icon">${ workout.type === 'running'?'🏃‍♂️': '🚴‍♀️' }</span>
             <span class="workout__value">${workout.distance}</span>
             <span class="workout__unit">km</span>
           </div>
           <div class="workout__details">
             <span class="workout__icon">⏱</span>
             <span class="workout__value">${workout.duration}</span>
             <span class="workout__unit">min</span>
          </div> `

        if(workout.type === 'running')
        html += `
        <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadance}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>
        `

        if(workout.type === 'cycling')
        html += `
        <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>
        `

        form.insertAdjacentHTML('afterend', html)

    }

    _moveToPopup(e){
        
      const workoutEl = e.target.closest('.workout')
      if(!workoutEl)return
      const workout = this.#workouts.find(work => work.id === workoutEl.dataset.id )
      this.#map.setView(workout.coords, this.#mapZoomLevel, {animate: true, duration: 1})
      //using the publick interface
        
      workout.click()
    }
}


 const app = new App()


 
