// Global app controller
import Search from './models/Search';
import * as searchView from './views/searchView';
import {elements,renderLoader,clearLoader} from './views/base';
/**Global state of the app
 * -search object
 * -recipe object
 * -shopping list object
 * -likes object
 */
const state={};
const controlSearch= async () =>{
    //1.get query from view
    const query=searchView.getInput();//TODO
   // console.log(query);
    if(query){
        //2.new Search object and it to state
        state.search=new Search(query);

        //3.prepare UI for results
            searchView.clearInput();
            searchView.clearResults();
            renderLoader(elements.searchRes);
        //4.search for recipes
        await state.search.getResults();

        //5.render results from UI
        clearLoader();
        searchView.renderResults(state.search.result);
      //  console.log(state.search.result);
    }
}
elements.searchForm.addEventListener('submit',e=>{
    e.preventDefault();
    controlSearch();
});
elements.searchResPages.addEventListener('click',e=>{
    const btn=e.target.closest('.btn-inline');
    const goToPage=parseInt(btn.dataset.goto,10);
    console.log(goToPage);
    searchView.clearResults();
    searchView.renderResults(state.search.result,goToPage);
})



//const res = await axios(`https://forkify-api.herokuapp.com/api/search?&q=${this.query}`);
//const res = await axios(`https://forkify-api.herokuapp.com/api/get?rId=${this.id}`);