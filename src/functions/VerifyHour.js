function VerifyHour(hour) {
  const today = new Date();

  if (today.getHours() !== hour + 3) {
    return false;
  }
  return true;
}

module.exports = VerifyHour;