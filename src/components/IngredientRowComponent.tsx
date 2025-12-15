import React, { useState, useEffect, ChangeEvent, FocusEvent } from 'react';
import { Ingredient } from '../types';
import { round } from '../constants';
import { Trash2 } from './icons';

interface IngredientRowProps {
  ingredient: Ingredient;
  onUpdate: (updatedValues: Partial<Ingredient>) => void;
  onRemove: () => void;
}

const IngredientRowComponent: React.FC<IngredientRowProps> = ({ ingredient, onUpdate, onRemove }) => {
  const [values, setValues] = useState<Ingredient>(ingredient);

  useEffect(() => {
    setValues(ingredient);
  }, [ingredient]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let processedValue: string | number = value;

    if (name !== 'name') {
      processedValue = value === '' ? '' : value; 
    }
    setValues((prev: Ingredient) => ({ ...prev, [name]: processedValue }));
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    let finalValue = values[name as keyof Ingredient];
    let changed = false;

    if (name !== 'name') {
      const currentValStr = String(values[name as keyof Ingredient]).trim();
      if (currentValStr === '') {
        finalValue = 0; 
        changed = String(values[name as keyof Ingredient]) !== String(finalValue);
      } else {
        const parsed = parseFloat(currentValStr);
        finalValue = isNaN(parsed) ? 0 : parsed; 
        changed = String(values[name as keyof Ingredient]) !== String(finalValue);
      }
    } else { 
        finalValue = String(values.name).trim();
        changed = values.name !== finalValue;
    }
    
    const updatedFullValues = { ...values, [name]: finalValue };
    if (changed) {
        setValues(updatedFullValues); 
    }
    onUpdate({ [name]: finalValue } as Partial<Ingredient>);
  };


  const getNumericValue = (field: keyof Ingredient): number => {
    const val = values[field];
    if (val === '' || val === null || val === undefined) return 0;
    const num = Number(val);
    return isNaN(num) ? 0 : num;
  }

  const calculated = {
    calories: round((getNumericValue('calories100g') / 100) * getNumericValue('grams')),
    protein: round((getNumericValue('protein100g') / 100) * getNumericValue('grams')),
    fat: round((getNumericValue('fat100g') / 100) * getNumericValue('grams')),
    carbs: round((getNumericValue('carbs100g') / 100) * getNumericValue('grams')),
  };

  // Base styles for all inputs in the row, NO w-full here.
  const inputBaseClass = "bg-slate-700/70 text-slate-100 p-3 rounded-md border border-slate-600/80 focus:ring-2 focus:ring-teal-500/70 focus:border-teal-500 outline-none transition-all duration-150 text-left";
  // Specific style for the ingredient name input (takes full width of its cell)
  const nameInputClass = `${inputBaseClass} w-full`;
  // Specific style for numeric inputs (fixed minimum width)
  const numericInputClass = `${inputBaseClass} min-w-[95px]`;


  let rowClass = "border-b border-slate-700/60 hover:bg-slate-700/50 transition-colors duration-150";
  if (ingredient.isNew) {
    rowClass += " ingredient-row-enter";
  } else if (ingredient.isRemoving) {
    rowClass += " ingredient-row-exit";
  }

  return (
    <tr className={rowClass}>
      <td className="px-4 py-3"> {/* Ingredient Name Cell */}
        <input type="text" name="name" value={values.name} onChange={handleChange} onBlur={handleBlur} placeholder="Ingredient name" className={nameInputClass} aria-label="Ingredient name"/>
      </td>
      {(['calories100g', 'protein100g', 'fat100g', 'carbs100g', 'grams'] as const).map(field => (
        <td key={field} className="px-3 py-3"> {/* Numeric Input Cells */}
          <input
            type="number"
            name={field}
            value={values[field] === '' || values[field] === null || values[field] === undefined ? '' : String(values[field])}
            onChange={handleChange}
            onBlur={handleBlur}
            className={numericInputClass}
            step="any"
            min="0"
            placeholder="0"
            aria-label={`${field.replace('100g', ' per 100g')}`}
          />
        </td>
      ))}
      {/* Calculated Value Cells */}
      <td className="px-3 py-3 text-center text-slate-200 font-medium text-sm">{calculated.calories}</td>
      <td className="px-3 py-3 text-center text-slate-200 font-medium text-sm">{calculated.protein}</td>
      <td className="px-3 py-3 text-center text-slate-200 font-medium text-sm">{calculated.fat}</td>
      <td className="px-3 py-3 text-center text-slate-200 font-medium text-sm">{calculated.carbs}</td>
      <td className="px-4 py-3 text-center"> {/* Action Cell */}
        <button 
          onClick={onRemove} 
          className="text-slate-400 hover:text-red-400 p-2 rounded-md hover:bg-red-500/10 transition-all duration-150 transform hover:scale-110" 
          aria-label="Remove ingredient"
        >
          <Trash2 size={20} />
        </button>
      </td>
    </tr>
  );
}
export default IngredientRowComponent;