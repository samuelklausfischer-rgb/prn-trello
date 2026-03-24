// Deprecated - Replaced by real PocketBase calls
import React, { createContext, useContext } from 'react'

const TaskContext = createContext<any>(null)

export function TaskProvider({ children }: { children: React.ReactNode }) {
  return React.createElement(TaskContext.Provider, { value: {} }, children)
}

export default function useTaskStore() {
  return useContext(TaskContext) || {}
}
