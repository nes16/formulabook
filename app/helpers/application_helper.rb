module ApplicationHelper

  # Returns the full title on a per-page basis.
  def full_title(page_title = '')
    base_title = "TestLab Application"
    if page_title.empty?
      base_title
    else
      "#{page_title} | #{base_title}"
    end
  end

  def getQueryCond
  	t1 = params["last_synced"]
  	t2 = params["current_sync"]
  	if t1 && t2
  	  time1 = Time.at( t1.to_i / 1000.0 ).to_s
  	  time2 = Time.at( t2.to_i / 1000.0 ).to_s
  	  cond1 = "(updated_at > \"#{time1}\") AND (updated_at < \"#{time2}\") AND "
  	else 
  	  if t2
  	    time2 = Time.at( t2.to_i / 1000.0 ).to_s
  	    cond1 = "(deleted IS NULL) AND (updated_at < \"#{time2}\") AND "
  	  else
  	    cond1 = '(deleted IS NULL) AND '
  	  end
  	end
  	
  	if current_user
  	  cond2 = "user_id IS \"#{current_user.id}\" OR"
  	else
  	  cond2 = ''
  	end
  	
  	cond = cond1 + ' (user_id IS NULL OR ' +  cond2 + " shared = \"t\")"
  	
  	return cond
  end

end

