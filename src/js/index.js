// Global app controller
import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
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

         //console.log(state.recipe.ingredients);
         //parsing ingredients
         state.recipe.parseIngredients();

        //calculate servings and time
        state.recipe.calcTime();
        state.recipe.calcServings();

        //render recipe
       // console.log(state.recipe);
       clearLoader();
       recipeView.renderRecipe(state.recipe,state.likes.isLiked(id));
      
        }catch(error){
            clearLoader();
            alert('error processing recipe');
        }
    }
}


['hashchange','load'].forEach(event=> window.addEventListener(event,controlRecipe));

//LIST CONTROLLER//
const controlList = () => {
    // Create a new list IF there in none yet
    if (!state.list) state.list = new List();

    // Add each ingredient to the list and UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
}

//handle delete and update list item events
elements.shopping.addEventListener('click',e=>{
    const id=e.target.closest('.shopping__item').dataset.itemid;
    if(e.target.matches('.shopping__delete, .shopping__delete *')){
        //1.delete item from list controller
            state.list.deleteItem(id);
        //2.delete item from UI
            listView.deleteItem(id);
    }else if(e.target.matches('.shopping__count-value')){
        //1.update count
        let newCount=parseFloat(e.target.value);
        state.list.updateCount(id,newCount);

    }

})

//LIKES CONTROLLER//
const controlLikes=() =>{
    //1.create new Like object if not any
    if(!state.likes) state.likes=new Likes();

    const currID=state.recipe.id

    //user has not yet liked current recipe
    if(!state.likes.isLiked(state.recipe.id)){
    //Add like to state
    const newLike=state.likes.addLike(currID,state.recipe.title,state.recipe.author,state.recipe.img);

    //toggle the like button
    likesView.toggleLikeBtn(true);

    //Add like to UI list
     // console.log(state.likes);
    likesView.renderLike(newLike);

    //user has liked current recipe
    }else{
        //delete like from state
        state.likes.deleteLike(currID);

        //toggle like button
        likesView.toggleLikeBtn(false);

        //delete like from UI list
        //console.log(state.likes);
        likesView.deleteLike(currID);
    }
    
    likesView.toggleLikeMenu(state.likes.getNumLikes());

}

//Restore liked recipes on page Load
window.addEventListener('load',() =>{
    //create new like object
    state.likes=new Likes();

    //read likes from localstorage
    state.likes.readStorage();

    //toggle like menu
    likesView.toggleLikeMenu(state.likes.getNumLikes());

    //render likes to UI
    state.likes.likes.forEach(like => likesView.renderLike(like));
})

// Handling recipe button clicks
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        // Decrease button is clicked
        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        // Increase button is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        // Add ingredients to shopping list
        controlList();
    }else if(e.target.matches('.recipe__love, .recipe__love *')){
        //Like controller
        controlLikes();
    }
   // console.log(state.recipe);
 
});
/*
//for testing purpose//
window.l=new List();
window.L=new Likes();
*/
