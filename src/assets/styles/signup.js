import { StyleSheet } from 'react-native';
import { colors, typography } from './global';

export default StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: colors.background,
  },
  input: {
    height: 40,
    borderColor: colors.secondary,
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    ...typography.body,
  },
  button: {
    backgroundColor: colors.secondary,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    ...typography.body,
  },
  link: {
    color: colors.primary,
    ...typography.body,
    textAlign: 'center',
    marginTop: 10,
  },
});
