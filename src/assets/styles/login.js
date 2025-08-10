import { StyleSheet, Platform, Dimensions } from 'react-native';
import { colors, typography } from './global';

const { width, height } = Dimensions.get('window');

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 107, 53, 0.05)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingTop: 50,
  },
  title: {
    ...typography.heading,
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 55,
  },
  inputIcon: {
    marginRight: 12,
    fontSize: 18,
    color: colors.darkGray,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.darkGray,
    paddingVertical: 0,
  },
  rememberForgotContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.darkGray,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmarkText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  rememberText: {
    fontSize: 16,
    color: colors.darkGray,
  },
  forgotPassword: {
    fontSize: 16,
    color: colors.primary,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 15,
  },
  link: {
    ...typography.link,
    marginTop: 10,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: 12,
    color: colors.darkGray,
    marginTop: 5,
  },
  navTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  navIcon: {
    fontSize: 24,
    color: colors.darkGray,
    marginBottom: 5,
  },
  navIconActive: {
    color: colors.primary,
  },
});
