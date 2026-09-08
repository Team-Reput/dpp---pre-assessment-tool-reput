const pool = require('../config/db');

const insertAssessmentContact = async (req, res) => {
  try {
    const { full_name, company, email } = req.body;

    const result = await pool.query(
      'SELECT dbo.fn_usp_insert_assessment_contact($1, $2, $3) AS result',
      [full_name, company, email]
    );

    const response = result.rows[0].result;
    res.status(response.status_code).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      status_code: 500,
      message: 'Something went wrong',
      data: null,
    });
  }
};

//module.exports = { insertAssessmentContact };



const insertProfile = async (req, res) => {
  try {
    const {
      ass_id,
      assessing_scope,
      product_category,
      primary_product_category,
      export_volume,
      export_markets, // expects a comma-separated string, e.g. "EU,UK,USA"
      tier,
    } = req.body;

    const result = await pool.query(
      'SELECT dbo.fn_usp_insert_assessment_profile($1, $2, $3, $4, $5, $6, $7) AS result',
      [ass_id, assessing_scope, product_category, primary_product_category, export_volume, export_markets, tier]
    );

    const response = result.rows[0].result;
    res.status(response.status_code).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      status_code: 500,
      message: 'Something went wrong',
      data: null,
    });
  }
};

const insertIdentification = async(req, res)=>{
  try{
    const{ass_id, status, data} = req.body;
    const result = await pool.query(
      'SELECT dbo.fn_usp_insert_product_identification($1, $2, $3) AS result',
      [ass_id, status, data]
    );
    const response = result.rows[0].result;
    res.status(response.status_code).json(response);
  }catch(err){
    console.error(err);
    res.status(500).json({
      success: false,
      status_code: 500,
      message: 'Something went wrong',
      data: null,
    });
  }
}

const insertMaterialComposition = async (req, res) => {
  try {
    const { ass_id, status, data } = req.body;

    const result = await pool.query(
      'SELECT dbo.fn_usp_insert_material_composition($1, $2, $3) AS result',
      [ass_id, status, data]
    );

    const response = result.rows[0].result;
    res.status(response.status_code).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      status_code: 500,
      message: 'Something went wrong',
      data: null,
    });
  }
};


// ── Material Origin ──────────────────────────────────────────
const insertMaterialOrigin = async (req, res) => {
  try {
    const { ass_id, status, data } = req.body;
    const result = await pool.query(
      'SELECT dbo.fn_usp_insert_material_origin($1, $2, $3) AS result',
      [ass_id, status, data]
    );
    const response = result.rows[0].result;
    res.status(response.status_code).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, status_code: 500, message: 'Something went wrong', data: null });
  }
};

// ── Supply Chain Data ────────────────────────────────────────
const insertSupplyChainData = async (req, res) => {
  try {
    const { ass_id, status, data } = req.body;
    const result = await pool.query(
      'SELECT dbo.fn_usp_insert_supply_chain_data($1, $2, $3) AS result',
      [ass_id, status, data]
    );
    const response = result.rows[0].result;
    res.status(response.status_code).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, status_code: 500, message: 'Something went wrong', data: null });
  }
};

// ── Traceability Data ────────────────────────────────────────
const insertTraceabilityData = async (req, res) => {
  try {
    const { ass_id, status, data } = req.body;
    const result = await pool.query(
      'SELECT dbo.fn_usp_insert_traceability_data($1, $2, $3) AS result',
      [ass_id, status, data]
    );
    const response = result.rows[0].result;
    res.status(response.status_code).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, status_code: 500, message: 'Something went wrong', data: null });
  }
};

// ── Sustainability Data ──────────────────────────────────────
const insertSustainabilityData = async (req, res) => {
  try {
    const { ass_id, status, data } = req.body;
    const result = await pool.query(
      'SELECT dbo.fn_usp_insert_sustainability_data($1, $2, $3) AS result',
      [ass_id, status, data]
    );
    const response = result.rows[0].result;
    res.status(response.status_code).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, status_code: 500, message: 'Something went wrong', data: null });
  }
};

// ── Compliance Certification ─────────────────────────────────
const insertComplianceCertification = async (req, res) => {
  try {
    const { ass_id, status, data } = req.body;
    const result = await pool.query(
      'SELECT dbo.fn_usp_insert_compliance_certification($1, $2, $3) AS result',
      [ass_id, status, data]
    );
    const response = result.rows[0].result;
    res.status(response.status_code).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, status_code: 500, message: 'Something went wrong', data: null });
  }
};

// ── Social Labor Data ────────────────────────────────────────
const insertSocialLaborData = async (req, res) => {
  try {
    const { ass_id, status, data } = req.body;
    const result = await pool.query(
      'SELECT dbo.fn_usp_insert_social_labor_data($1, $2, $3) AS result',
      [ass_id, status, data]
    );
    const response = result.rows[0].result;
    res.status(response.status_code).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, status_code: 500, message: 'Something went wrong', data: null });
  }
};

const insertExtendedData = async (req, res) => {
  try {
    const { ass_id, data_points } = req.body;

    const result = await pool.query(
      'SELECT dbo.fn_usp_insert_assessment_extended_data($1, $2) AS result',
      [ass_id, data_points]
    );

    const response = result.rows[0].result;
    res.status(response.status_code).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, status_code: 500, message: 'Something went wrong', data: null });
  }
};

const insertAssessmentStructure = async (req, res) => {
  try {
    const { ass_id, structure } = req.body;

    const result = await pool.query(
      'SELECT dbo.fn_usp_insert_assessment_structure($1, $2) AS result',
      [ass_id, structure]
    );

    const response = result.rows[0].result;
    res.status(response.status_code).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, status_code: 500, message: 'Something went wrong', data: null });
  }
};


const getAssessmentScore = async (req, res) => {
  try {
    const { ass_id } = req.params;

    const result = await pool.query(
      'SELECT dbo.fn_usp_get_assessment_score($1) AS result',
      [ass_id]
    );

    const response = result.rows[0].result;
    res.status(response.status_code).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, status_code: 500, message: 'Something went wrong', data: null });
  }
};


const nodemailer = require('nodemailer');

const emailReport = async (req, res) => {
  try {
    const { ass_id } = req.body;

    // Step 1: look up the contact's name + email using ass_id
    const contactResult = await pool.query(
      'SELECT full_name, email FROM dbo.assessment_contact WHERE ass_id = $1',
      [ass_id]
    );

    if (contactResult.rows.length === 0) {
      return res.status(404).json({ success: false, status_code: 404, message: 'Contact not found', data: null });
    }

    const { full_name, email } = contactResult.rows[0];

    // Step 2: get the score for this assessment
    const scoreResult = await pool.query(
      'SELECT dbo.fn_usp_get_assessment_score($1) AS result',
      [ass_id]
    );
    const scoreData = scoreResult.rows[0].result.data;

    // Step 3: build a simple email body from the score
    const sectionsHtml = Object.entries(scoreData.sections)
      .map(([key, value]) => `<li>${key.replace(/_/g, ' ')}: ${value}%</li>`)
      .join('');

    const emailHtml = `
      <h2>Your DPP Readiness Report</h2>
      <p>Hi ${full_name},</p>
      <p>Your overall readiness score is <strong>${scoreData.overall_score}%</strong>.</p>
      <h3>Breakdown:</h3>
      <ul>${sectionsHtml}</ul>
      <p>— BluWin × Reput.ai</p>
    `;

    // Step 4: send the email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM,   // ⬅ sent FROM your Gmail (the .env one)
       to: email,                      // ⬅ sent TO whoever filled the Contact form — fetched from the database
      
      subject: 'Your DPP Readiness Report',
      html: emailHtml,
    });

    res.status(200).json({ success: true, status_code: 200, message: 'Report emailed successfully', data: { email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, status_code: 500, message: 'Something went wrong', data: null });
  }
};



module.exports = {
  insertAssessmentContact,
  insertProfile,
  insertIdentification,
  insertMaterialComposition,
  insertMaterialOrigin,
  insertSupplyChainData,
  insertTraceabilityData,
  insertSustainabilityData,
  insertComplianceCertification,
  insertSocialLaborData,
  insertExtendedData,
  insertAssessmentStructure, 
  getAssessmentScore,
  emailReport,  // ⬅ add here
};