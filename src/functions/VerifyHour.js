function VerifyHour(hour) {
  const today = new Date();

  if (today.getHours() !== hour) {
    return false;
  }
  return true;
}

module.exports = VerifyHour;