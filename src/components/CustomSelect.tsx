import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface CustomSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: string[];
}

const CustomSelect: React.FC<CustomSelectProps> = ({ value, onValueChange, options }) => {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setOpen(!open)} style={styles.select}>
        <Text style={styles.selectText}>{value}</Text>
        <Text style={styles.selectArrow}>{open ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {open && (
        <View style={styles.dropdown}>
          {options.map(opt => (
            <TouchableOpacity
              key={opt}
              onPress={() => {
                onValueChange(opt);
                setOpen(false);
              }}
              style={styles.optionContainer}
            >
              <Text style={styles.optionText}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginBottom: 5,
  },
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    justifyContent: 'space-between',
  },
  selectText: {
    fontSize: 16,
    color: '#333',
  },
  selectArrow: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  dropdown: {
    position: 'absolute',
    bottom: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    zIndex: 10,
  },
  optionContainer: {
    padding: 8,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
});

export default CustomSelect;
