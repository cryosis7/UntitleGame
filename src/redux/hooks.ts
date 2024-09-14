// This file serves as a central hub for re-exporting pre-typed Redux hooks.
// These imports are restricted elsewhere to ensure consistent
// usage of typed hooks throughout the application.
// We disable the ESLint rule here because this is the designated place
// for importing and re-exporting the typed versions of hooks.
/* eslint-disable @typescript-eslint/no-restricted-imports */
import { useDispatch as useRootDispatch, useSelector as useRootSelector } from "react-redux"
import type { AppDispatch, RootState } from "./store"

// Re-export the hooks with the correct types
export const useDispatch = useRootDispatch.withTypes<AppDispatch>()
export const useSelector = useRootSelector.withTypes<RootState>()
