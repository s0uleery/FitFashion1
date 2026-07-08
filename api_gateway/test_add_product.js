const query = `mutation {
  createProduct(input: {
    name: "Jean Azul Mujer"
    price: 48990
    stock: 15
    description: "Jean azul casual que se adapta atu cuerpo."
    layerIndex: 3
    builderImage: ""
    galleryImages: []
    categories: ["Jean", "Casual"]
    styles: ["Casual", "Verano"]
  }) {
    status
    message
    product_id
  }
}`;

async function main() {
    // 1. Login as admin
    const loginRes = await fetch('http://localhost:3000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'mutation { login(username: "admin", password: "admin123") { token } }'})
    });
    const loginData = await loginRes.json();
    const token = loginData.data.login.token;
    
    // 2. Add product
    const prodRes = await fetch('http://localhost:3000/graphql', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`
        },
        body: JSON.stringify({ query })
    });
    
    const prodData = await prodRes.json();
    console.dir(prodData, { depth: null });
}

main().catch(console.error);
