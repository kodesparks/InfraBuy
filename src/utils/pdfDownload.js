import ReactNativeBlobUtil from 'react-native-blob-util';
import { Platform } from 'react-native';

/**
 * Download PDF from URL (with auth) to device and open with PDF viewer / Chrome.
 * Android: saves to Downloads (via Download Manager or cache+path), then opens with actionViewIntent.
 * iOS: saves to cache and tries to open with document viewer.
 * @param {string} fullUrl - Full API URL (e.g. https://api.infraxpert.in/api/order/customer/orders/CT-001/pdf/quote)
 * @param {string} token - Bearer token
 * @param {string} filename - Display name (e.g. 'Quote', 'Invoice')
 * @returns {Promise<{ success: boolean, is404?: boolean, error?: string }>}
 */
export async function downloadAndOpenPdf(fullUrl, token, filename = 'document') {
  const safeName = filename.replace(/[^a-zA-Z0-9-_]/g, '_');
  const pdfFilename = `${safeName}.pdf`;

  try {
    const options = {
      fileCache: true,
      appendExt: 'pdf',
      addAndroidDownloads: Platform.OS === 'android' ? {
        useDownloadManager: true,
        notification: true,
        title: pdfFilename,
        description: `${filename} PDF`,
        mime: 'application/pdf',
        mediaScannable: true,
      } : undefined,
    };

    const response = await ReactNativeBlobUtil.config(options).fetch('GET', fullUrl, {
      Authorization: `Bearer ${token}`,
      'Accept': 'application/pdf',
    });

    const status = (response.info && response.info().status) || response.respInfo?.status || 0;
    const getApiMessage = async () => {
      try {
        const raw = response.text?.();
        const text = typeof raw?.then === 'function' ? await raw : raw;
        if (text && typeof text === 'string') {
          const j = JSON.parse(text);
          return j?.message || null;
        }
      } catch (_) {}
      return null;
    };
    if (status === 404) {
      const apiMessage = await getApiMessage();
      return { success: false, is404: true, error: 'Document not ready', apiMessage };
    }
    if (status < 200 || status >= 300) {
      const apiMessage = await getApiMessage();
      return { success: false, error: `Download failed (${status})`, apiMessage };
    }

    const path = response.path();
    if (!path) {
      return { success: false, error: 'Download failed' };
    }

    if (Platform.OS === 'android' && ReactNativeBlobUtil.android?.actionViewIntent) {
      try {
        await ReactNativeBlobUtil.android.actionViewIntent(path, 'application/pdf', `Open ${filename}`);
        return { success: true, opened: true };
      } catch (openErr) {
        return { success: true, opened: false };
      }
    }

    if (Platform.OS === 'ios' && ReactNativeBlobUtil.ios?.openDocument) {
      try {
        await ReactNativeBlobUtil.ios.openDocument(path, 'application/pdf');
        return { success: true, opened: true };
      } catch (openErr) {
        return { success: true, opened: false };
      }
    }

    return { success: true, opened: false };
  } catch (err) {
    const msg = err?.message || String(err);
    const statusCode = typeof err === 'number' ? err : (err?.statusCode ?? err?.response?.status);
    const is404 = statusCode === 404 || msg.includes('404');
    return {
      success: false,
      is404: !!is404,
      error: is404 ? 'Document not ready' : (msg || 'Download failed'),
    };
  }
}
