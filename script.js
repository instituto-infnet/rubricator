window.rubricator = {
  clearAll: function() {
    const items = document.querySelectorAll('.rubric-criteria .criterion');
    items.forEach(item => {
      const deleteBtn = item.querySelector('.delete');
      if (deleteBtn) deleteBtn.click();
    });
  }
};