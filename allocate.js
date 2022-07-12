/**
 * Sorts by ascending date an array of [purchases | orders] objects, A property of type string formatted as YYYY-MM-DD is required on each object.
 * @param  {Array}  unsortedArray Unsorted array of [purchases | orders]. 
 * @param  {String} key           Specify the property keyname holding a date
 * @return {Array}                Array of objects sorted by ascending date
 */
 const sortbyDate= (unsortedArray, key) => {
  let sortedArray = unsortedArray.map(obj => {
    return {...obj, date: new Date(obj[key])};
  });
  sortedArray = sortedArray.sort(
    (objA, objB) => Number(objA.date) - Number(objB.date)
  );
  return sortedArray;
}


/**
 * Validates a string, returns true if a date formatted as YYYY-MM-DD is found. 
 * @param  {string}  evalString  Any string
 * @return {Boolean}             returns [true = valid | false = invalid]
 */
function dateIsValid(evalString) {
  if (typeof evalString !== 'string'){
    return false;
  }
  const expectedFormat = /^\d{4}-\d{2}-\d{2}$/;
  if (evalString.match(expectedFormat) === null) {
    return false;
  }
  let dateFound = new Date(evalString);
  let timestamp = dateFound.getTime();
  if (typeof timestamp !== 'number' || Number.isNaN(timestamp)) {
    return false;
  }
  return true;
}


/**
 * Inspect an array of [purchases | orders] and returns the name of the property that contains a date formatted as YYYY-MM-DD. 
 * @param  {Array}  someArray  An arrary of [purchases | orders] 
 * @return {string}            returns [property name | null].
 */
const getDateKey= (someArray) =>{
  let availableKeys = Object.keys(someArray[0]);
  let dateKey = null;
  availableKeys.forEach(key => {
    if (dateIsValid(someArray[0][key])){
      dateKey = key;
    }
  }); 
  return dateKey; 
}


/**
 * Check for availavity of a product given an array of sales and an array of purchases. 
 * @param  {Array}  salesOrders     An arrary of orders
 * @param  {Array}  purchaseOrders  An arrary of purchases
 * @return {Array}                  An arrary of deliveryDates
 */
 function allocate (salesOrders, purchaseOrders) {  
  let salesKey = '';
  let purchaseKey = '';
  let stock = 0;
  let demand = 0;
  let finished = false;
  let idxPurchases = 0 ;
  let results = [];
  let sortedSales = [];
  let sortedPurchases = [];
  try{
    salesKey = getDateKey(salesOrders);
    purchaseKey = getDateKey(purchaseOrders);
  }catch(error){
    console.error("INVALID INPUT: Sales and/or purchase objects must have a property that contains a date formatted as YYYY-MM-DD")
    return;
  }
  
  sortedSales =  sortbyDate(salesOrders,salesKey);
  sortedPurchases = sortbyDate(purchaseOrders, purchaseKey);
  
  for ( let idxSales = 0 ; idxSales < salesOrders.length ; idxSales++ ){
    let deliverDate = null;    
    demand = sortedSales[idxSales].quantity;
    //using a while give more control on how the purchases array is inspected
    while (!finished){
      if ( idxPurchases == sortedPurchases.length ){
        finished = true;
        break;
      }
      //update stock
      stock = stock+sortedPurchases[idxPurchases].quantity; 
      //move on
      idxPurchases++;
      //verify if the sale can be supplied if not, just move
      if ( demand <= stock){  
        //update stock
        stock  = stock - demand;
        //get deliver date
        deliverDate= sortedPurchases[idxPurchases-1].date.toISOString().substring(0, 10);
        //check if the next order could be supplied at a closer date
        if((0>idxSales+1< salesOrders.length) && (sortedSales[idxSales].quantity <= stock)){
          //in case it is posible, stay in the same purchase, hence will use the current date for the next saleOrder (a closer date)
          idxPurchases--;
        }
        break;
      }
    }
    //create an object with the result 
    let saleOrder= {'salesOrderId':sortedSales[idxSales].id, 'availabilityDate': deliverDate};
    //append to results array
    results.push(saleOrder);
  }  
  return results;
}

module.exports = allocate