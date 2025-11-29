import { useState } from 'react'
import { useIsAuthenticated, useMsal } from '@azure/msal-react'
import { InteractionRequiredAuthError } from '@azure/msal-browser'
import { loginRequest, apiConfig } from './authConfig'
import './App.css'

interface WeatherForecast {
  date: string
  temperatureC: number
  temperatureF: number
  summary: string
}

function App() {
  const { instance, accounts } = useMsal()
  const isAuthenticated = useIsAuthenticated()
  const [weatherData, setWeatherData] = useState<WeatherForecast[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async () => {
    try {
      await instance.loginPopup(loginRequest)
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await instance.logoutPopup({
        postLogoutRedirectUri: window.location.origin,
      })
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const fetchWeatherData = async () => {
    if (!accounts[0]) {
      setError('No active account. Please sign in.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Get access token silently
      const tokenResponse = await instance.acquireTokenSilent({
        ...loginRequest,
        account: accounts[0],
      })

      // Call the protected API with Bearer token
      const response = await fetch(apiConfig.weatherEndpoint, {
        headers: {
          Authorization: `Bearer ${tokenResponse.accessToken}`,
        },
      })

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      setWeatherData(data)
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        // Fallback to interactive login if silent acquisition fails
        try {
          const tokenResponse = await instance.acquireTokenPopup(loginRequest)
          
          const response = await fetch(apiConfig.weatherEndpoint, {
            headers: {
              Authorization: `Bearer ${tokenResponse.accessToken}`,
            },
          })

          if (!response.ok) {
            throw new Error(`API call failed: ${response.status} ${response.statusText}`)
          }

          const data = await response.json()
          setWeatherData(data)
        } catch (interactiveError) {
          console.error('Interactive token acquisition failed:', interactiveError)
          setError('Failed to acquire token interactively')
        }
      } else {
        console.error('API call failed:', error)
        setError(error instanceof Error ? error.message : 'Failed to fetch weather data')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <h1>React MSAL Weather App</h1>
      
      <div className="card">
        {!isAuthenticated ? (
          <button onClick={handleLogin}>Sign In with Entra ID</button>
        ) : (
          <>
            <p>Welcome, {accounts[0]?.name || accounts[0]?.username}!</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px' }}>
              <button onClick={fetchWeatherData} disabled={loading}>
                {loading ? 'Loading...' : 'Fetch Weather Data'}
              </button>
              <button onClick={handleLogout}>Sign Out</button>
            </div>
          </>
        )}
      </div>

      {error && (
        <div className="error" style={{ color: 'red', marginTop: '20px' }}>
          <p>Error: {error}</p>
        </div>
      )}

      {weatherData.length > 0 && (
        <div className="weather-table" style={{ marginTop: '20px' }}>
          <h2>Weather Forecast</h2>
          <table style={{ margin: '0 auto', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ccc', padding: '10px' }}>Date</th>
                <th style={{ border: '1px solid #ccc', padding: '10px' }}>Temp (C)</th>
                <th style={{ border: '1px solid #ccc', padding: '10px' }}>Temp (F)</th>
                <th style={{ border: '1px solid #ccc', padding: '10px' }}>Summary</th>
              </tr>
            </thead>
            <tbody>
              {weatherData.map((weather, index) => (
                <tr key={index}>
                  <td style={{ border: '1px solid #ccc', padding: '10px' }}>{weather.date}</td>
                  <td style={{ border: '1px solid #ccc', padding: '10px' }}>{weather.temperatureC}</td>
                  <td style={{ border: '1px solid #ccc', padding: '10px' }}>{weather.temperatureF}</td>
                  <td style={{ border: '1px solid #ccc', padding: '10px' }}>{weather.summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="read-the-docs" style={{ marginTop: '30px' }}>
        This app uses MSAL.js to authenticate with Azure Entra ID and fetch data from a protected .NET API
      </p>
    </>
  )
}

export default App
