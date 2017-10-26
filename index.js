//Currency Converter

//Create a currency converter that converts a user’s selected base currency and outputs the equivalent money value of the exchange currency using the current day’s rate.

//Include two select inputs, one for base currency and second for equivalent currency, which make use of the json found at: https://gist.githubusercontent.com/mddenton/062fa4caf150bdf845994fc7a3533f74/raw/b0d1722b04b0a737aade2ce6e055263625a0b435/Common-Currency.json

//For the base currency, create a masked currency input that:

 // Shows the symbol of the selected base currency
 // Is formatted to two decimal places
 // On focus sets the cursor to the rightmost decimal position
 // Only allows numbers
 // When a new number is inserted shifts the decimal right one place,
 // When deleted shifts the decimal left one place

// Currency rates are available from http://fixer.io/. Be sure to use https:// for your requests.

// Use the money.js library (see this jsfiddle's External Resources) to convert the selected base currency to its chosen equivalent money value. For more details: http://openexchangerates.github.io/money.js/

// Best practice would be to inform the user if their selected currency is not available from fixer.io using inline validation. In order to more easily test error handling, allow the user to select a currency not available from fixer.io and present the error returned.

// Show the equivalent money value's currency symbol which is included in the above Common-Currency.json endpoint.

// Use React but do not include jQuery in your project.

class CurrencyConverter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      currencies: [],
      currencyNames: {},
      rates: {},
      cache: {},
      base: '',
      to: '',
      baseCurrSym: '',
      convertTo: '',
      solution: '0.00'
    };
  }
  
  componentWillMount() {
    const curURL = 'https://gist.githubusercontent.com/mddenton/062fa4caf150bdf845994fc7a3533f74/raw/b0d1722b04b0a737aade2ce6e055263625a0b435/Common-Currency.json'   
    axios.get(curURL)
      .then((res) => {
 			  let names = []
        for (var key in res.data) {
          let obj = {}
          obj.abrvName = key;
          obj.data = res.data[key]
          names.push(obj)
        }
        this.setState({currencies: names, currencyNames: Object.assign({}, res.data)})
      })
      
    // make initial GET to get available currencies from fixer.io to prevent
    // unecessary api calls
    axios.get('https://api.fixer.io/latest?base=USD')
      .then((res) => { 
        let obj = Object.assign({}, res.data.rates)
        obj['USD'] = 1
        this.setState({rates: obj, cache: {'USD': obj}})
      })
  }
  
  handleCurrChange(e) {
    //determine if selected currency is available from fixer.io based on inital fetch
    if (this.state.rates[e.target.value]) {
      // handle base currency
      if (e.target.className === 'base') {
        // if base currency already fetched for this session,
        // use the cached base rate instead of making api call
        if (this.state.cache[e.target.value]) {
          console.log('USING CACHED DATA inside')
          this.setState({
            rates: this.state.cache[e.target.value],
            [e.target.id]: this.state.currencyNames[e.target.value].symbol,
            [e.target.className]: e.target.value,
            solution: '0.00'
          })
	
        } else {
          e.persist() // to persist through async axios call
          // if not already cached as a base rate, fetch new base rates
           axios.get(`https://api.fixer.io/latest?base=${e.target.value}`)
            .then((res) => {   
              let obj = Object.assign({}, res.data.rates)
              obj[e.target.value] = 1
              this.setState({
                rates: obj,
                cache: Object.assign(this.state.cache, {[e.target.value]: obj}),
                [e.target.id]: this.state.currencyNames[e.target.value].symbol,
                [e.target.className]: e.target.value,
                solution: '0.00'
              })
            })
        }
      } else {
        // if convertTo currency changes, make the change
        this.setState({
          [e.target.id]: this.state.currencyNames[e.target.value].symbol,
          [e.target.className]: e.target.value,
          solution: '0.00'
        })
      }
    } else {
    // if currency chosen doesn't exist with fixer.io, instead of making a
    // failed api call with error handling, alert to choose another currency
      alert('That currency is unavailable. Please choose a different one')
    }
  }
  
  handleInputChange(e) {
    if (!isNaN(Number(e.target.value))) {
   
      let curr = e.target.value.split('')
      if (curr.length === 1) {
        curr[0] = '0.0' + curr[0]
      } else if (curr.length === 2) {
        curr.shift()
        curr[0] = '0.0' + curr[0]
      } else {
        if (curr[0] === "0") {
          curr.shift()
        }
        curr.length > 1 && curr.splice(curr.indexOf('.'), 1)
        curr.splice(-2, 0, '.')
      }

      this.setState({value: curr.join('')})
    }
  }
  
  convertCurrency(e) {
    e.preventDefault()

    if (this.state.convertTo === '' || this.state.baseCurrSym === '') {
      alert('Please fill in all fields')
    } else {
      fx.base = this.state.base;
      fx.rates = this.state.rates
      console.log('rates used', this.state.rates)
      var result = fx.convert(Number(this.state.value), {from: this.state.base, to: this.state.to})
      this.setState({solution: result.toFixed(2)})
    }
  }

  makeSelects(className, id) {
  	return (
  		<select className={className} id={id} onChange={this.handleCurrChange.bind(this)}>
  		  <option selected hidden>Choose a currency</option> 
  		  {this.state.currencies.map((val, i) => {
  		      return <option key={i} value={val.abrvName}>{val.abrvName} - {val.data.name}</option>
  		    })
  		  }
  		</select>
  	)
  }

  render() {
    return (
      <div>
        <div>Convert from:</div>
 				{this.makeSelects('base', 'baseCurrSym')}
        <br/><br/>

        <div>Convert to:</div>
        {this.makeSelects('to', 'convertTo')}
        <br/><br/>
        
        <form onSubmit={this.convertCurrency.bind(this)}>
          <div className="input-icon">
            <i>{this.state.baseCurrSym}</i>
            <input type="text" placeholder="0.00" value={this.state.value} onChange={this.handleInputChange.bind(this)} required={true}/>
            <br/><br/>
            <button>Convert to</button><span id="solution">{this.state.convertTo}</span><label id="solution">{this.state.solution}</label>
          </div>
        </form>
      </div>
    )
  }
};
 
ReactDOM.render(<CurrencyConverter />, document.getElementById('container'));