var search_result_card = `
<div class="col">
  <div class="card">
    <div class="card-body">
      <div class="embed-responsive embed-responsive-16by9">
        <iframe class="embed-responsive-item" src="//www.youtube.com/embed/zpOULjyy-n8"></iframe>
      </div>
      <h4 class="search_result_card_title">title</h4>
      <p class="search_result_card_description">
        desc
      </p>
    </div>
    <div class="card-footer">
      <div class="row">
        <div class="col">
          <button class="btn btn-primary btn-block play" data-id=""> <i class="fas fa-play"></i> </button>
        </div>
        <div class="col">
          <form action="/download" method="post">
            <input type="hidden" name="id" value="id">
            <button class="btn btn-success btn-block" type="submit"> <i class="fas fa-download"></i> </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</div>
`;

$(document).on("submit", "form", function (e) {
  e.preventDefault();
  const t = $(this);
  $.ajax({
    url: t.attr("action"),
    method: t.attr("method") || "POST",
    data: t.serialize(),
    success: function (res) {
      console.log(res);
      $("#search-result").html(JSON.stringify(res, null, 2));
    },
  });
});
