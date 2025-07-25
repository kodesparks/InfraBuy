import { StyleSheet, Platform } from 'react-native';
import { colors, typography } from './global';

export default StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: Platform.OS === 'ios' ? 20 : 15,
    backgroundColor: colors.background,
  },
  input: {
    height: 50,
    borderColor: colors.primary,
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 12,
    borderRadius: 8,
    ...typography.body,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    ...typography.body,
    fontWeight: '500',
  },
  errorText: {
    color: colors.error,
    ...typography.body,
    marginTop: 5,
    textAlign: 'center',
  },
});
