document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("searchInput");
    const searchButton = document.getElementById("searchButton");
    const recipeList = document.getElementById("recipeList");
    const addRecipeForm = document.getElementById("addRecipeForm");
    const subscribeButton = document.getElementById("subscribeButton");

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
            const recipeItem = createRecipeElement(recipe);
            recipeList.appendChild(recipeItem);
            displayComments(recipe.id);
        });
    }

    // Display comments for a recipe
    async function displayComments(recipeId) {
        const commentsList = document.getElementById(`comments-${recipeId}`);
        try {
            const response = await fetch(`http://localhost:3000/comments?recipeId=${recipeId}`);
            if (!response.ok) {
                throw new Error("Failed to fetch comments");
            }
            const comments = await response.json();
            commentsList.innerHTML = "";
            comments.forEach(comment => {
                const commentItem = document.createElement("li");
                commentItem.textContent = comment.text;
                commentsList.appendChild(commentItem);
            });
        } catch (error) {
            console.error("Error fetching comments:", error.message);
        }
    }

    // Add comment to a recipe
    async function addComment(recipeId, text) {
        try {
            const response = await fetch("http://localhost:3000/comments", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ recipeId, text })
            });
            if (!response.ok) {
                throw new Error("Failed to add comment");
            }
            displayComments(recipeId);
        } catch (error) {
            console.error("Error adding comment:", error.message);
        }
    }

    // Add recipe form submission
    addRecipeForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const formData = new FormData(addRecipeForm);
        const recipeData = {
            name: formData.get("name"),
            image: formData.get("image"),
            ingredients: formData.get("ingredients").split(","),
            instructions: formData.get("instructions")
        };
        try {
            const response = await fetch("http://localhost:3000/recipes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(recipeData)
            });
            if (!response.ok) {
                throw new Error("Failed to add recipe");
            }
            // Reset the form and display updated recipes
            addRecipeForm.reset();
            await displayRecipes();
        } catch (error) {
            console.error("Error adding recipe:", error.message);
        }
    });

    // Subscribe for updates
    subscribeButton.addEventListener("click", async () => {
        const email = document.getElementById("emailInput").value;
        try {
            const response = await fetch("http://localhost:3000/subscriptions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email })
            });
            if (!response.ok) {
                throw new Error("Failed to subscribe");
            }
            alert("Subscribed successfully!");
            document.getElementById("emailInput").value = "";
        } catch (error) {
            console.error("Error subscribing:", error.message);
        }
    });

    // Event listener for search button
    searchButton.addEventListener("click", async () => {
        const searchQuery = searchInput.value.trim().toLowerCase();
        if (searchQuery === "") {
            displayRecipes();
        } else {
            try {
                const recipes = await fetchRecipes();
                const filteredRecipes = recipes.filter(recipe => {
                    return (
                        recipe.name.toLowerCase().includes(searchQuery) ||
                        recipe.ingredients.some(ingredient => ingredient.toLowerCase().includes(searchQuery))
                    );
                });
                recipeList.innerHTML = "";
                if (filteredRecipes.length === 0) {
                    recipeList.innerHTML = "<p>No matching recipes found</p>";
                } else {
                    filteredRecipes.forEach(recipe => {
                        const recipeItem = createRecipeElement(recipe);
                        recipeList.appendChild(recipeItem);
                        displayComments(recipe.id);
                    });
                }
            } catch (error) {
                console.error("Error searching recipes:", error.message);
            }
        }
    });

    // Event listener for add comment form submission
    recipeList.addEventListener("submit", event => {
        event.preventDefault();
        if (event.target.classList.contains("comment-form")) {
            const recipeId = event.target.querySelector(".comment-input").dataset.recipeId;
            const text = event.target.querySelector(".comment-input").value;
            if (text.trim() !== "") {
                addComment(recipeId, text);
                event.target.querySelector(".comment-input").value = "";
            }
        }
    });

    // Event listener for delete button
    recipeList.addEventListener("click", async (event) => {
        if (event.target.classList.contains("delete-button")) {
            const recipeId = event.target.dataset.id;
            try {
                const response = await fetch(`http://localhost:3000/recipes/${recipeId}`, {
                    method: "DELETE"
                });
                if (!response.ok) {
                    throw new Error("Failed to delete recipe");
                }
                await displayRecipes();
            } catch (error) {
                console.error("Error deleting recipe:", error.message);
            }
        }
    });

    // Initial display of recipes
    displayRecipes();

    // Function to create recipe element
    function createRecipeElement(recipe) {
        const recipeItem = document.createElement("div");
        recipeItem.classList.add("recipe");
        recipeItem.innerHTML = `
            <h2>${recipe.name}</h2>
            <img src="${recipe.image}" alt="${recipe.name}" class="recipe-image">
            <p><strong>Ingredients:</strong> ${recipe.ingredients.join(", ")}</p>
            <p><strong>Instructions:</strong> ${recipe.instructions}</p>
            <div class="comment-section">
                <h3>Comments</h3>
                <ul id="comments-${recipe.id}"></ul>
                <form class="comment-form">
                    <input type="text" placeholder="Add a comment" class="comment-input" data-recipe-id="${recipe.id}">
                    <button type="submit" class="comment-submit">Add Comment</button>
                </form>
            </div>
            <button class="edit-button" data-id="${recipe.id}">Edit</button>
            <button class="delete-button" data-id="${recipe.id}">Delete</button>
        `;
        return recipeItem;
    }
});
