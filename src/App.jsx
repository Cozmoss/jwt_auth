import { useState } from "react";
import "./App.css";

const API_URL = "http://localhost:8080";
const TOKEN_STORAGE_KEY = "jwt";

function App() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [token, setToken] = useState(
		localStorage.getItem(TOKEN_STORAGE_KEY) || "",
	);
	const [result, setResult] = useState(
		"Cliquez sur le bouton pour tester l'api",
	);
	const [loading, setLoading] = useState(false);

	function saveToken(newToken) {
		setToken(newToken);
		localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
	}

	function getToken() {
		return localStorage.getItem(TOKEN_STORAGE_KEY) || "";
	}

	function deleteToken() {
		localStorage.removeItem(TOKEN_STORAGE_KEY);
		setToken("");
		setResult("Token supprimé");
	}

	async function readResponseBody(response) {
		const text = await response.text();
		const contentType = response.headers.get("content-type") || "";
		if (contentType.includes("application/json")) {
			try {
				return JSON.parse(text);
			} catch {
				return text;
			}
		}
		return text;
	}

	async function requestApi(path, options = {}) {
		setLoading(true);
		setResult("Chargement en cours...");

		try {
			const url = `${API_URL}${path}`;
			const headers = {
				Accept: "application/json",
				...(options.headers || {}),
			};
			const fetchOptions = {
				...options,
				headers,
			};

			if (
				fetchOptions.body &&
				typeof fetchOptions.body === "object" &&
				!(fetchOptions.body instanceof FormData)
			) {
				if (!fetchOptions.headers["Content-Type"]) {
					fetchOptions.headers["Content-Type"] = "application/json";
				}
				if (
					fetchOptions.headers["Content-Type"].includes(
						"application/json",
					)
				) {
					fetchOptions.body = JSON.stringify(fetchOptions.body);
				}
			}

			const response = await fetch(url, fetchOptions);
			const body = await readResponseBody(response);

			if (!response.ok) {
				const errorMessage = `Vous n'êtes pas autorisé :\n- Vérifiez que l'api tourne bien\n- Vérifiez vos identifiants\n- Vérifiez que vous avez les bons droits\n\n(Erreur ${response.status})`;
				setResult(errorMessage);
				return { ok: false, status: response.status, body };
			}

			return { ok: true, status: response.status, body };
		} catch (error) {
			setResult(`Erreur réseau : ${error.message}`);
			return { ok: false, status: null, body: null };
		} finally {
			setLoading(false);
		}
	}

	async function login() {
		const result = await requestApi("/api/v1/auth/login", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				username: username,
				password: password,
			}),
		});
		if (!result || !result.ok) {
			return;
		}
		const data = result.body;

		if (typeof data === "string") {
			saveToken(data);
			setResult("Connexion réussie. Token stocké localement.");
		} else if (data.token) {
			saveToken(data.token);
			setResult("Connexion réussie. Token stocké localement.");
		} else {
			setResult(
				"Connexion réussie mais aucun token reçu. " +
					JSON.stringify(data),
			);
		}
	}

	async function testPublicRoute() {
		const result = await requestApi("/api/v1/public");
		if (!result || !result.ok) {
			return;
		}
		const data = result.body;
		setResult(
			typeof data === "string" ? data : JSON.stringify(data, null, 2),
		);
	}

	async function testProtectedRouteWithJwt() {
		const currentToken = token || getToken();
		if (!currentToken) {
			setResult(
				"Aucun token JWT trouvé. Veuillez vous connecter d'abord.",
			);
			return;
		}

		const result = await requestApi("/api/v1/protected", {
			method: "GET",
			headers: {
				Authorization: `Bearer ${currentToken}`,
			},
		});

		if (!result || !result.ok) {
			return;
		}

		const data = result.body;
		setResult(
			typeof data === "string" ? data : JSON.stringify(data, null, 2),
		);
	}

	return (
		<>
			<h1>React + Spring Security JWT Authentication</h1>
			<form>
				<div className="input-container">
                    <div className="input-group">
                        <label>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="input-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>
				<div className="button-container">
                    <button className="btn-primary" type="button" onClick={login} disabled={loading}>
                        Connexion JWT
                    </button>
                    <button
                        type="button"
                                        className="btn-primary"
                        onClick={testPublicRoute}
                        disabled={loading}>
                        Route publique
                    </button>
                    <button
                        type="button"
                                        className="btn-primary"
                        onClick={testProtectedRouteWithJwt}
                        disabled={loading}>
                        Route protégée avec JWT
                    </button>
                    <button type="button" className="btn-delete" onClick={deleteToken}>
                        Supprimer le token
                    </button>
                </div>
			</form>
			<div className="token-display">
				<p>Token JWT :</p>
				<textarea value={token} readOnly rows={5} cols={50} />
			</div>
			<div className="result-display">
				<p>Résultat de l'API :</p>
				<textarea value={result} readOnly rows={10} cols={50} />
			</div>
		</>
	);
}

export default App;
