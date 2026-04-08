import { useState, useRef } from 'react'
import { analyzeProfile }   from '../api'
import { buildAnalyzePayload } from '../utils/mortgage'
import { ANALYZE_DEFAULTS } from '../constants'

/**
 * Encapsulates all state and logic for the Analyze page form.
 * Components stay declarative  no fetch or transformation code needed.
 */
export function useAnalyze() {
  const [values,    setValues]    = useState(ANALYZE_DEFAULTS)
  const [result,    setResult]    = useState(null)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState(null)
  const [collapsed, setCollapsed] = useState(false)
  const resultsRef = useRef(null)

  function handleChange(key, val) {
    setValues(prev => ({ ...prev, [key]: val }))
  }

  async function handleSubmit() {
    setLoading(true)
    setError(null)
    setResult(null)
    setCollapsed(false)

    try {
      const data = await analyzeProfile(buildAnalyzePayload(values))
      setResult(data)
      setCollapsed(true)
      setTimeout(
        () => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
        100,
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return {
    values,
    result,
    loading,
    error,
    collapsed,
    resultsRef,
    handleChange,
    handleSubmit,
    resetForm: () => setCollapsed(false),
  }
}
