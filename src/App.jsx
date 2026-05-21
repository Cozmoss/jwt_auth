import { useState } from 'react'
import './App.css'

const API_URL = 'http://localhost:8080'
const TOKEN_STORAGE_KEY = 'jwt'

function App() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [token, setToken] = useState(localStorage.getItem('jwt') || '')
  const [result, setResult] = useState("Cliquez sur le bouton pour tester l'api")
  const [loading, setLoading] = useState(true)

  function saveToken(newToken) {
    setToken(newToken)
    localStorage.setItem('jwt', newToken)
  }

  function getToken() {
    const token = localStorage.getItem('jwt')
    console.log(token)
    return token
  }

  function deleteToken() {
    localStorage.removeItem('jwt')
    setToken('')
    setResult('Token supprimé')
  }

  async function readResponseBody() {

  }

  async function requestApi(path, options = {}) {
    try {
        setLoading(true)
    }
    catch (error) {
      setResult('Erreur lors de la requête API')
    }
  }

  async function testPublicRoute() {

  }

  async function testProtectedRouteWithJwt() {
    if (!token) {
        setResult('Aucun token JWT trouvé. Veuillez vous connecter d\'abord.')
        return
    }
    await requestApi('/api/v1/protected', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
  }

  return (
    <>
      <h1>React + Spring Security JWT Authentication</h1>
      <form>
        <div>
            <label>Username</label>
            <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
        </div>
        <div>
            <label>Password</label>
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
        </div>
        <button type="button" onClick={testPublicRoute} disabled={loading}>Login JWT</button>
        <button type="button" onClick={testPublicRoute}>Route publique</button>
        <button type="button" onClick={testProtectedRouteWithJwt} disabled={loading}>Route protégée avec JWT</button>
        <button type="button" onClick={deleteToken}>Supprimer le token</button>
      </form>
      <div>
        <p>Token JWT:</p>
        <textarea value={token} readOnly rows={5} cols={50} />
      </div>
      <div>
        <p>Résultat de l'API:</p>
        <textarea value={result} readOnly rows={10} cols={50} />
      </div>
    </>
  )
}

export default App
