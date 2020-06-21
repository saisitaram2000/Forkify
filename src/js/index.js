// Global app controller
import Search from './models/Search';
import Recipe from './models/Recipe';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import {elements,renderLoader,clearLoader} from './views/base';

/**Global state of the app
 * -search object
 * -recipe object
 * -shopping list object
 * -likes object
 */
const state={};


//SEARCH CONTROLLER//
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
            try{
                      //4.search for recipes
        await state.search.getResults();

        //5.render results from UI
        clearLoader();
        searchView.renderResults(state.search.result);
      //  console.log(state.search.result);
    }catch(error){
        alert('something went wrong with search!');
        clearLoader();
    }
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
});

//RECIPE CONTROLLER//
const controlRecipe= async()=>{

    const id=window.location.hash.replace('#','');
    console.log(id);
    if(id){
        //prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        //highlight selected search
        if(state.search) searchView.highlightSelected(id);

        //create new recipe obj
        state.recipe=new Recipe(id);
        
        try{
        //Get recipe data & parseIngredients
        await state.recipe.getRecipe();
      //  console.log(state.recipe.ingredients);
         state.recipe.parseIngredients();
        //calculate servings and time
        state.recipe.calcTime();
        state.recipe.calcServings();

        //render recipe
       // console.log(state.recipe);
       clearLoader();
       recipeView.renderRecipe(state.recipe);
      
        }catch(error){
            clearLoader();
            alert('error processing recipe');
        }
    }
}
['hashchange','load'].forEach(event=> window.addEventListener(event,controlRecipe));
elements.recipe.addEventListener('click',e=>{
    if(e.target.matches('.btn-decrease, .btn-decrease *')){
        if(state.recipe.servings>1){
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    }else if(e.target.matches('.btn-increase, .btn-increase *')){
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    }
   // console.log(state.recipe);
 
});



//const res = await axios(`https://forkify-api.herokuapp.com/api/search?&q=${this.query}`);
//const res = await axios(`https://forkify-api.herokuapp.com/api/get?rId=${this.id}`);