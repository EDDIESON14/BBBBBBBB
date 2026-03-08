// EMAIL MODULE
// ===============================================
const EmailModule = (() => {

  let emailConfig = {
    serviceId: '',
    templateId: '',
    publicKey: '',
    configured: false
  };

  // Load saved config
  function loadEmailConfig() {
    const stored = localStorage.getItem(Config.EMAIL_CONFIG_KEY);

    if (stored) {
      emailConfig = JSON.parse(stored);

      if (emailConfig.configured && emailConfig.publicKey) {
        emailjs.init(emailConfig.publicKey);
      }
    }

    return emailConfig;
  }

  // Save EmailJS config
  function saveEmailConfig(config) {
    emailConfig = { ...config, configured: true };

    localStorage.setItem(
      Config.EMAIL_CONFIG_KEY,
      JSON.stringify(emailConfig)
    );

    emailjs.init(emailConfig.publicKey);

    updateEmailStatusDisplay();
  }

  function isConfigured() {
    return (
      emailConfig.configured &&
      emailConfig.serviceId &&
      emailConfig.templateId &&
      emailConfig.publicKey
    );
  }

  function getConfig() {
    return emailConfig;
  }

  // ===============================================
  // GENERATE BARCODE
  // ===============================================
  async function generateBarcodeImage(code) {

    return new Promise((resolve) => {

      const canvas = document.createElement("canvas");

      JsBarcode(canvas, code, {
        format: "CODE128",
        width: 2,
        height: 100,
        displayValue: true,
        fontSize: 16,
        margin: 10
      });

      const dataUrl = canvas.toDataURL("image/png");

      resolve(dataUrl);

    });

  }

  // ===============================================
  // GENERATE QR CODE
  // ===============================================
  async function generateQRCodeImage(code) {

    return new Promise((resolve) => {

      const container = document.createElement("div");
      container.style.display = "none";

      document.body.appendChild(container);

      const qr = new QRCode(container, {
        text: code,
        width: 256,
        height: 256
      });

      setTimeout(() => {

        const canvas = container.querySelector("canvas");

        if (canvas) {
          const dataUrl = canvas.toDataURL("image/png");
          document.body.removeChild(container);
          resolve(dataUrl);
        } else {
          resolve("");
        }

      }, 200);

    });

  }

  // ===============================================
  // SEND MEMBER EMAIL
  // ===============================================
  async function sendMemberEmail(member) {

    if (!isConfigured()) {
      throw new Error("EmailJS not configured.");
    }

    try {

      const barcode1D = await generateBarcodeImage(member.qrCode);
      const qrCode2D = await generateQRCodeImage(member.qrCode);

      await emailjs.send(
        emailConfig.serviceId,
        emailConfig.templateId,
        {
          to_email: member.email,
          member_name: member.name,
          membership_type: member.membershipType,
          start_date: member.startDate,
          expiry_date: member.expiryDate,
          member_code: member.qrCode,
          barcode_1d: barcode1D,
          qr_code_2d: qrCode2D
        }
      );

      return {
        success: true,
        message: "Email sent successfully!"
      };

    } catch (error) {

      return {
        success: false,
        message: error.text || error.message
      };

    }

  }

  // ===============================================
  // EMAIL CONFIG FORM
  // ===============================================
  function loadEmailConfigForm() {

    if (emailConfig.configured) {

      document.getElementById("emailServiceId").value =
        emailConfig.serviceId;

      document.getElementById("emailTemplateId").value =
        emailConfig.templateId;

      document.getElementById("emailPublicKey").value =
        emailConfig.publicKey;

    }

    updateEmailStatusDisplay();
  }

  // ===============================================
  // EMAIL STATUS
  // ===============================================
  function updateEmailStatusDisplay() {

    const statusText =
      document.getElementById("emailStatusText");

    if (!statusText) return;

    if (emailConfig.configured) {

      statusText.innerHTML =
        `<span style="color:green;font-weight:bold;">✅ Configured</span><br>
        <span>Service ID: ${emailConfig.serviceId}</span><br>
        <span>Template ID: ${emailConfig.templateId}</span>`;

    } else {

      statusText.innerHTML =
        `<span style="color:red;">❌ Not configured yet</span>`;

    }

  }

  // ===============================================
  // OTP EMAIL
  // ===============================================
  async function sendOTPEmail(account, otp, expiryMinutes) {

    if (!isConfigured()) {
      return {
        success: false,
        message: "EmailJS not configured."
      };
    }

    try {

      await emailjs.send(
        emailConfig.serviceId,
        emailConfig.otpTemplateId || emailConfig.templateId,
        {
          to_email: account.email,
          to_name: account.fullName,
          otp_code: otp,
          expiry_minutes: expiryMinutes,
          username: account.username,
          gym_name: "Believe Gym"
        }
      );

      return { success: true };

    } catch (error) {

      return {
        success: false,
        message: error.text || error.message
      };

    }

  }

  function loadOTPTemplateConfig() {

    const el = document.getElementById("otpTemplateId");

    if (el && emailConfig.otpTemplateId) {
      el.value = emailConfig.otpTemplateId;
    }

  }

  function saveOTPTemplate(otpTemplateId) {

    emailConfig.otpTemplateId = otpTemplateId;

    localStorage.setItem(
      Config.EMAIL_CONFIG_KEY,
      JSON.stringify(emailConfig)
    );

    UIModule.showToast(
      "OTP Template ID saved!",
      "success"
    );

  }

  // ===============================================
  return {
    loadEmailConfig,
    saveEmailConfig,
    isConfigured,
    getConfig,
    sendMemberEmail,
    sendOTPEmail,
    loadEmailConfigForm,
    updateEmailStatusDisplay,
    loadOTPTemplateConfig,
    saveOTPTemplate
  };

})();