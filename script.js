document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("searchInput");
    const recipeList = document.getElementById("recipeList");
  
    // Fetch recipes from JSON server
    async function fetchRecipes() {
      try {
        const response = await fetch("http://localhost:3000/recipes");
        if (!response.ok) {
          throw new Error("Failed to fetch recipes");
        }
        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Error fetching recipes:", error.message);
      }
    }
  
    // Display recipes
    async function displayRecipes() {
      const recipes = await fetchRecipes();
      recipeList.innerHTML = "";
      recipes.forEach(recipe => {
        const recipeItem = document.createElement("div");
        recipeItem.classList.add("recipe");
        recipeItem.innerHTML = `
          <h2>${recipe.name}</h2>
          <img src="${recipe.image}" alt="${recipe.name}" class="recipe-image">
          <p><strong>Ingredients:</strong> ${recipe.ingredients.join(", ")}</p>
          <p><strong>Instructions:</strong> ${recipe.instructions}</p>
        `;
        recipeList.appendChild(recipeItem);
      });
    }
  
    // Sort recipes by name
    document.getElementById("sortByName").addEventListener("click", () => {
      recipes.sort((a, b) => a.name.localeCompare(b.name));
      displayRecipes();
    });
  
    // Sort recipes by ingredients
    document.getElementById("sortByIngredients").addEventListener("click", () => {
      recipes.sort((a, b) => a.ingredients.length - b.ingredients.length);
      displayRecipes();
    });
  
    // Search recipes
    searchInput.addEventListener("input", () => {
      const searchValue = searchInput.value.toLowerCase();
      const recipeItems = recipeList.getElementsByClassName("recipe");
      Array.from(recipeItems).forEach(recipeItem => {
        const recipeName = recipeItem.getElementsByTagName("h2")[0].textContent.toLowerCase();
        if (recipeName.includes(searchValue)) {
          recipeItem.style.display = "block";
        } else {
          recipeItem.style.display = "none";
        }
      });
    });
  
    // Add click event listener to each recipe card
    recipeList.addEventListener("click", event => {
      const recipeCard = event.target.closest(".recipe");
      if (recipeCard) {
        // Logic to handle when a recipe card is clicked
      }
    });
  
    // Initial display of recipes
    displayRecipes();
  });
  