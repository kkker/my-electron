// 備援實作：在一般瀏覽器開啟（例如直接連 Vite 開發伺服器）時使用，不具備原生能力

const NOT_SUPPORTED = '目前平台不支援此功能（非 Electron / 行動裝置環境）';

export const getDbInfo = async () => ({ ok: false, error: NOT_SUPPORTED });

export const getSystemInfo = async () => NOT_SUPPORTED;
