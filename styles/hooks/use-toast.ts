"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"

type ToastProps = {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: "default" | "destructive"
}

type ToastState = {
  toasts: ToastProps[]
}

const TOAST_TIMEOUT = 5000

export function useToast() {
  const [state, setState] = useState<ToastState>({
    toasts: [],
  })

  const toast = useCallback(({ title, description, action, variant = "default" }: Omit<ToastProps, "id">) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast: ToastProps = {
      id,
      title,
      description,
      action,
      variant,
    }

    setState((prev) => ({
      toasts: [...prev.toasts, newToast],
    }))

    return id
  }, [])

  const dismiss = useCallback((id: string) => {
    setState((prev) => ({
      toasts: prev.toasts.filter((toast) => toast.id !== id),
    }))
  }, [])

  useEffect(() => {
    const timers: NodeJS.Timeout[] = []

    state.toasts.forEach((toast) => {
      const timer = setTimeout(() => {
        dismiss(toast.id)
      }, TOAST_TIMEOUT)

      timers.push(timer)
    })

    return () => {
      timers.forEach((timer) => clearTimeout(timer))
    }
  }, [state.toasts, dismiss])

  return {
    ...state,
    toast,
    dismiss,
  }
}
