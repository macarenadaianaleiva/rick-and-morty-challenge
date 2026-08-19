// Pulls in @testing-library/jest-dom's global `expect` matcher augmentation
// (toBeInTheDocument, toHaveAttribute, etc.) for the type checker. The
// runtime side is wired separately in jest.setup.js — this file only needs
// to exist somewhere `tsconfig.json`'s `include` picks up so `tsc` sees it.
import '@testing-library/jest-dom';
