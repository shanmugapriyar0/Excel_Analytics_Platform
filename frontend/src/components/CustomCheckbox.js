import "../css/CustomCheckbox.css";

const CustomCheckbox = ({ label, checked, onChange }) => {
  return (
    <div className="custom-checkbox-container">
      <label className="custom-checkbox">
        <input 
          type="checkbox" 
          checked={checked} 
          onChange={onChange}
        />
        <span className="checkmark"></span>
        <span className="checkbox-label">{label}</span>
      </label>
    </div>
  );
};

export default CustomCheckbox;
