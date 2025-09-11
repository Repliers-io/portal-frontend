'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState
} from 'react'

import { type PropertyInsightFeature } from 'services/API'

const galleryNames = [
  'gallery',
  'fullscreen-gallery',
  'fullscreen-ribbon',
  'slideshow'
] as const

const dialogNames = [
  'ai',
  'contact',
  'cookie',
  'remove-favorite',
  'remove-image',
  'filters',
  'auth',
  'otp-auth',
  'profile',
  'property',
  'unknown',
  'save-search',
  'delete-saved-search',
  'confirm-estimate-removal',
  ...galleryNames
] as const

export type DialogName = (typeof dialogNames)[number]
export type GalleryName = (typeof galleryNames)[number]
type DialogState = Record<DialogName, boolean>

export type GalleryDialogProps = {
  active: number
  images: string[]
  tab?: 'grid' | 'groups'
  group?: PropertyInsightFeature
}

export const hasDialog = (str: string): str is DialogName =>
  dialogNames.includes(str as DialogName)

type DialogNamedContextType<T = object> = {
  animate: boolean
  visible: boolean
  showDialog: (options?: T) => void
  showDialogInstantly: (options?: T) => void
  showExclusiveDialog: (options?: T) => void
  hideDialog: () => void
  hideDialogInstantly: () => void
  hideAllDialogs: () => void
  getOptions: () => T
}

type DialogContextType<T = object> = {
  animate: boolean
  visible: (name: DialogName) => boolean
  showDialog: (name: DialogName, options?: T) => void
  hideDialog: (name: DialogName) => void
  showDialogInstantly: (name: DialogName, options?: T) => void
  hideDialogInstantly: (name: DialogName) => void
  showExclusiveDialog: (name: DialogName, options?: T) => void
  hideAllDialogs: () => void
  getOptions: (name: DialogName) => T
}

const createInitialDialogState = (): DialogState =>
  dialogNames.reduce(
    (acc, name) => ({
      ...acc,
      [name]: false
    }),
    {} as DialogState
  )

const initialDialogState = createInitialDialogState()

const DialogContext = createContext<DialogContextType | undefined>(undefined)

const DialogProvider = ({ children }: { children: React.ReactNode }) => {
  const [states, setStates] = useState<DialogState>(initialDialogState)
  const [animate, setAnimate] = useState(true)
  const [options, setOptions] = useState<Partial<Record<DialogName, object>>>(
    {}
  )

  const showDialog = useCallback(function <T = object>(
    name: DialogName,
    opts?: T
  ) {
    setOptions((prev) => ({ ...prev, [name]: opts || {} }))
    setStates((prev) => ({ ...prev, [name]: true }))
    setAnimate(true)
  }, [])

  const showExclusiveDialog = useCallback(function <T = object>(
    name: DialogName,
    opts?: T
  ) {
    setOptions((prev) => ({ ...prev, [name]: opts || {} }))
    setStates(() => ({
      ...initialDialogState,
      [name]: true
    }))
  }, [])

  const showDialogInstantly = useCallback(
    function <T = object>(name: DialogName, opts?: T) {
      setOptions((prev) => ({ ...prev, [name]: opts || {} }))
      showDialog(name, opts)
      setAnimate(false)
    },
    [showDialog]
  )

  const hideDialog = useCallback((name: DialogName) => {
    setOptions((prev) => ({ ...prev, [name]: null }))
    setStates((prev) => ({ ...prev, [name]: false }))
    setAnimate(true)
  }, [])

  const hideDialogInstantly = useCallback(
    (name: DialogName) => {
      hideDialog(name)
      setAnimate(false)
    },
    [hideDialog]
  )

  const hideAllDialogs = useCallback(() => {
    setOptions({})
    setStates(initialDialogState)
  }, [])

  const visible = useCallback((name: DialogName) => !!states[name], [states])

  const getOptions = useCallback(
    (name: DialogName) => {
      return options[name] || {}
    },
    [options]
  )

  const contextValue = useMemo(
    () => ({
      animate,
      visible,
      getOptions,
      hideDialog,
      hideAllDialogs,
      hideDialogInstantly,
      showDialog,
      showDialogInstantly,
      showExclusiveDialog
    }),
    [
      animate,
      visible,
      getOptions,
      hideDialog,
      hideAllDialogs,
      hideDialogInstantly,
      showDialog,
      showDialogInstantly,
      showExclusiveDialog
    ]
  )

  return (
    <DialogContext.Provider value={contextValue}>
      {children}
    </DialogContext.Provider>
  )
}

export default DialogProvider

export const useDialogContext = () => {
  const context = useContext(DialogContext)
  if (!context) {
    throw Error('useDialogContext must be used within a DialogProvider')
  }
  return context
}

export function useDialog<T extends object = object>(
  name: DialogName
): DialogNamedContextType<T> {
  const ctx = useDialogContext()

  if (!ctx) {
    throw Error('useDialog must be used within a DialogProvider')
  }

  if (!hasDialog(name)) {
    throw Error(`Dialog name "${name}" is not valid`)
  }

  return {
    animate: ctx.animate,
    visible: ctx.visible(name),
    getOptions: () => ctx.getOptions(name) as T,
    showDialog: (opts?: T) => ctx.showDialog(name, opts),
    showDialogInstantly: (opts?: T) => ctx.showDialogInstantly(name, opts),
    showExclusiveDialog: (opts?: T) => ctx.showExclusiveDialog(name, opts),
    hideDialogInstantly: () => ctx.hideDialogInstantly(name),
    hideDialog: () => ctx.hideDialog(name),
    hideAllDialogs: ctx.hideAllDialogs
  }
}
