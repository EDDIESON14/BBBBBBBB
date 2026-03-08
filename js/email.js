// EMAIL MODULE
// ===============================================
const EmailModule = (() => {
  let emailConfig = { serviceId:'', templateId:'', publicKey:'', configured: false };

  function loadEmailConfig() {
    const stored = localStorage.getItem(Config.EMAIL_CONFIG_KEY);
    if (stored) { emailConfig = JSON.parse(stored); if (emailConfig.configured && emailConfig.publicKey) emailjs.init(emailConfig.publicKey); }
    return emailConfig;
  }

  function saveEmailConfig(config) {
    emailConfig = { ...config, configured: true };
    localStorage.setItem(Config.EMAIL_CONFIG_KEY, JSON.stringify(emailConfig));
    emailjs.init(emailConfig.publicKey);
    updateEmailStatusDisplay();
  }

  function isConfigured() { return emailConfig.configured && emailConfig.serviceId && emailConfig.templateId && emailConfig.publicKey; }
  function getConfig() { return emailConfig; }

  async function generateBarcodeImage(code) {
    return new Promise(resolve => {
      const tempSvg = document.createElementNS('http://www.w3.org/2000/svg','svg');
      JsBarcode(tempSvg, code, { format:'CODE128', width:2, height:100, displayValue:true, fontSize:16, margin:10 });
      const svgData = new XMLSerializer().serializeToString(tempSvg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = function() { canvas.width = img.width; canvas.height = img.height; ctx.drawImage(img,0,0); resolve(canvas.toDataURL('image/png')); };
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    });
  }

  async function generateQRCodeImage(code) {
    return new Promise(resolve => {
      const tempContainer = document.createElement('div');
      tempContainer.style.display = 'none';
      document.body.appendChild(tempContainer);
      new QRCode(tempContainer, { text: code, width: 256, height: 256 });
      setTimeout(() => {
        const canvas = tempContainer.querySelector('canvas');
        if (canvas) { const dataUrl = canvas.toDataURL('image/png'); document.body.removeChild(tempContainer); resolve(dataUrl); }
      }, 100);
    });
  }

  async function sendMemberEmail(member) {
    if (!isConfigured()) throw new Error('EmailJS not configured.');
    try {
      const barcode1D = await generateBarcodeImage(member.qrCode);
      const qrCode2D = await generateQRCodeImage(member.qrCode);
      const response = await emailjs.send(emailConfig.serviceId, emailConfig.templateId, {
        to_email: member.email, member_name: member.name, membership_type: member.membershipType,
        start_date: member.startDate, expiry_date: member.expiryDate, member_code: member.qrCode,
        barcode_1d: barcode1D, qr_code_2d: qrCode2D
      });
      return { success: true, message: 'Email sent successfully!' };
    } catch (error) {
      return { success: false, message: `Failed to send email: ${error.text || error.message}` };
    }
  }

  function loadEmailConfigForm() {
    if (emailConfig.configured) {
      document.getElementById('emailServiceId').value = emailConfig.serviceId;
      document.getElementById('emailTemplateId').value = emailConfig.templateId;
      document.getElementById('emailPublicKey').value = emailConfig.publicKey;
    }
    updateEmailStatusDisplay();
  }

  function updateEmailStatusDisplay() {
    const statusText = document.getElementById('emailStatusText');
    if (!statusText) return;
    if (emailConfig.configured) {
      statusText.innerHTML = `<span class="text-green-600 font-bold">✅ Configured</span><br><span class="text-sm">Service ID: ${emailConfig.serviceId}</span><br><span class="text-sm">Template ID: ${emailConfig.templateId}</span>`;
    } else {
      statusText.textContent = '❌ Not configured yet';
    }
  }

  async function sendOTPEmail(account, otp, expiryMinutes) {
    if (!isConfigured()) return { success: false, message: 'EmailJS not configured.' };
    try {
      await emailjs.send(emailConfig.serviceId, emailConfig.otpTemplateId || emailConfig.templateId, {
        to_email: account.email,
        to_name: account.fullName,
        otp_code: otp,
        expiry_minutes: expiryMinutes,
        username: account.username,
        gym_name: 'ShapeUp Gym'
      });
      return { success: true };
    } catch (error) {
      return { success: false, message: error.text || error.message };
    }
  }

  function loadOTPTemplateConfig() {
    const el = document.getElementById('otpTemplateId');
    if (el && emailConfig.otpTemplateId) el.value = emailConfig.otpTemplateId;
  }

  function saveOTPTemplate(otpTemplateId) {
    emailConfig.otpTemplateId = otpTemplateId;
    localStorage.setItem(Config.EMAIL_CONFIG_KEY, JSON.stringify(emailConfig));
    UIModule.showToast('OTP Template ID saved!', 'success');
  }

  return { loadEmailConfig, saveEmailConfig, isConfigured, getConfig, sendMemberEmail, sendOTPEmail, loadEmailConfigForm, updateEmailStatusDisplay, loadOTPTemplateConfig, saveOTPTemplate };
})();

// ===============================================
